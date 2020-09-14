const User = require('../schemas/user.schema');
const { hash, genSalt, compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { firstUpper } = require('../helpers/helpers');
const { config } = require('dotenv');
const { OAuth2Client } = require('google-auth-library');


config();

const CLIENT_ID = process.env.CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);


const SECRET = process.env.SECRET;

const register = async (req, res) => {

    try {
        const { username, email, password } = req.body;

        const user = new User({
            username: firstUpper(username),
            email: email.toLowerCase(),
            password,
            google: false
        });

        const salt = await genSalt(10);
        user.password = await hash(password, salt);

        await user.save();

        const tokenBody = { username: user.username, email: user.email, _id: user._id };
        const token = await sign(tokenBody, SECRET, { expiresIn: '4h' });

        return res.json({ ok: true, message: 'User Successfully created', user, token });

    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            if (Object.keys(error.keyPattern)[0] === 'username') {
                return res.status(422).json({ ok: false, message: 'Username already exists' });
            }
            if (Object.keys(error.keyPattern)[0] === 'email') {
                return res.status(422).json({ ok: false, message: 'Email already exists' });
            }
        }
        return res.status(500).json({ ok: false, message: 'Internal server Error' });
    }

}

const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).populate('posts.postId').populate('chatList.msgId');
        if (!user) return res.status(404).json({ ok: false, message: 'User or password is wrong' });

        if (user.google) return res.status(400).json({
            ok: false,
            message: 'You sould login with your google account. Click on the button bellow'
        });

        const isValid = await compare(password, user.password);
        if (!isValid) return res.status(400).json({ ok: false, message: 'User or password is wrong' })

        const tokenBody = { username: user.username, email: user.email, _id: user._id };
        const token = await sign(tokenBody, SECRET, { expiresIn: '4h' });

        return res.json({ ok: true, user, token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }


};

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
        username: payload.name,
        email: payload.email,
        google: true,
        img: payload.picture
    }
};

const googleSignIn = async (req, res) => {
    const { token } = req.body;
    try {
        const googleUser = await verify(token);
        const user = await User.findOne({ email: googleUser.email }).populate('chatList.msgId');
        if (user) {
            if (user.google === false) {
                return res.status(400).json({ ok: false, message: 'You should login with email and password validation' });
            }

            const tokenBody = { username: user.username, email: user.email, _id: user._id };
            const token = await sign(tokenBody, SECRET, { expiresIn: '4h' })
            return res.json({ ok: true, user, token });
        } else {
            const newUser = await User.create({
                username: googleUser.username,
                email: googleUser.email,
                google: true,
                img: googleUser.img
            })
            const tokenBody = { username: newUser.username, email: newUser.email, _id: newUser._id };
            const token = await sign(tokenBody, SECRET, { expiresIn: '4h' });
            return res.json({ ok: true, user: newUser, token });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
};


const renovateToken = async (req, res) => {
    const jwtPayload = { username: req.user.username, email: req.user.email, _id: req.user._id };
    const token = await sign(jwtPayload, SECRET, { expiresIn: '4h' });
    return res.json({ ok: true, token });
};

module.exports = { register, login, googleSignIn, renovateToken };