const cloudinary = require('cloudinary').v2;
const { config } = require('dotenv');
const User = require('../schemas/user.schema');

config();

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

cloudinary.config({ cloud_name, api_key, api_secret });

const changeProfileImage = async (req, res) => {

    const { image } = req.body;

    try {

        const result = await cloudinary.uploader.upload(image, { allowed_formats: ['jpg', 'png', 'gif', 'jpeg'] });

        const picId = result.public_id;
        const picVersion = result.version;

        const user = await User.findById(req.user._id);

        if (user.picId !== 'avatar_tmoqrv.png' && user.picVersion !== '1591573111') {
            await cloudinary.uploader.destroy(user.picId);
        }

        await User.findByIdAndUpdate(req.user._id, { picId, picVersion }, { new: true });

        return res.json({ ok: true, message: 'Profile picture successfully updated' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }

};

module.exports = { changeProfileImage };