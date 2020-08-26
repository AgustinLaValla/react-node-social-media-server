const { verify } = require('jsonwebtoken');
const { config } = require('dotenv');

config();

const SECRET = process.env.SECRET;

const validateToken = async (req, res, next) => {

    if (!req.get('Authorization')) return res.status(401).json({ ok: false, message: 'No Token Provided' });
    const token = req.get('Authorization').split(' ')[1];

    try {
        const decoded = await verify(token, SECRET);
        req.user = { email: decoded.email, username: decoded.username, _id: decoded._id };
    } catch (error) {
        console.log(error);
        if (error.expiredAt < Date.now())
            return res.status(500).json({
                ok: false,
                message: 'Token has expired. Please, login again',
                token: null
            });
        return res.status(500).json({ ok: false, message: 'Internal server error' });
    }


    next();
}

module.exports = { validateToken };