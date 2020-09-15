const User = require('../schemas/user.schema');

const getUsers = async (req, res) => {
    try {
        return res.json({ ok: true, users: await User.find().populate('posts.postId') });
    } catch (error) {
        console.log(error);
    }

}

const getUser = async (req, res) => {

    const { id } = req.params;

    try {

        const user = await User.findById(id).populate({
            path: 'posts',
            populate: {
                path: 'postId',
                model: 'Post'
            }
        }).populate({
            path: 'posts',
            populate: {
                path: 'postId',
                populate: [
                    {
                        path: 'likes',
                        populate: {
                            path: 'userId',
                            model: 'User',
                            select: '_id'
                        }
                    },
                    {
                        path: 'userId',
                        model: 'User'
                    }
                ]
            }

        }).populate({
            path: 'chatList',
            populate: [
                {
                    path: 'receiverId',
                    model: 'User'
                },
                {
                    path: 'msgId',
                    model: 'Message'
                }
            ],

        });
        if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

        return res.json({ ok: true, user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }

}

const addUserDetails = async (req, res) => {
    const { bio, website, location } = req.body;

    let userData = {}

    if (bio && bio.trim().length > 0) userData.bio = bio.trim();
    if (website && website.trim().length > 0) {
        if (website.trim().substring(0, 4) !== 'http') {
            userData.website = 'https://' + website.trim();
        } else {
            userData.website = website.trim();
        }
    }
    if (location && location.trim().length > 0) userData.location = location;

    try {
        const user = await User.findByIdAndUpdate(req.user._id, userData, { new: true }).populate('posts.postId');

        return res.json({ ok: true, message: 'User data successfully updated', user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }

};

const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;
    try {
        await User.updateOne({
            $and: [
                { _id: req.user._id },
                { 'notifications.postNotifications._id': notificationId }

            ]
        }, { $set: { 'notifications.postNotifications.$[elem].read': true } },
            { arrayFilters: [{ 'elem._id': notificationId }] }
        );

        return res.json({ ok: true, message: 'Notification successfully marked' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user._id },
            { $set: { 'notifications.postNotifications.$[elem].read': true } },
            { arrayFilters: [{ 'elem.read': false }] }
        )

        return res.json({ ok: true, message: 'Notifications successfully marked' });

    } catch (error) {
        console.log(error);
    }
}

const searchUsers = async (req, res) => {
    const regex = new RegExp(req.params.search, 'i');
    try {
        const users = await User.find({username:regex});
        return res.json({ ok: true, users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ok:false, message:'Internal server Error'});
    }
}

module.exports = { getUsers, getUser, addUserDetails, markNotificationAsRead, markAllNotificationsAsRead, searchUsers };