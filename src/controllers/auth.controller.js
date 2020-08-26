const User = require('../schemas/user.schema');
const { hash, genSalt, compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { firstUpper } = require('../helpers/helpers');
const { config } = require('dotenv');

config();

const SECRET = process.env.SECRET;

const register = async (req, res) => {

    console.log(SECRET);

    try {
        const { username, email, password } = req.body;

        const user = new User({ username: firstUpper(username), email: email.toLowerCase(), password });

        const salt = await genSalt(10);
        user.password = await hash(password, salt);

        await user.save();

        const tokenBody = { username: user.username, email: user.email, _id:user._id };
        const token = await sign(tokenBody, SECRET, { expiresIn: '4h' });

        return res.json({ ok: true, message: 'User Successfully created', user: tokenBody, token });

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

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ ok: false, message: 'User or password is wrong' });

        const isValid = await compare(password, user.password);
        if (!isValid) return res.status(400).json({ ok: false, message: 'User or password is wrong' })

        const tokenBody = { username: user.username, email: user.email, _id:user._id };
        const token = await sign(tokenBody, SECRET, { expiresIn: '4h' });

        return res.json({ ok: true, user: tokenBody, token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }


};

module.exports = { register, login };