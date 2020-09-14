const User = require('../schemas/user.schema');

const updateChatList = async (req, msgId) => {
    await User.updateOne({ id: req.user._id }, {
        $pull: {
            chatList: {
                receiverId: req.params.receiverId
            }
        }
    });

    await User.updateOne({ id: req.user._id }, {
        $push: {
            chatList: {
                $each: [
                    {
                        receiverId: req.params.receiverId,
                        msgId: msgId
                    }
                ],
                $position: 0
            }
        }
    });

    if(req.user._id === req.params.receiverId) return

    await User.updateOne({ id: req.params.receiverId }, {
        $pull: {
            chatList: {
                receiverId: req.user._id
            }
        }
    });


    await User.updateOne({ id: req.params.receiverId }, {
        $push: {
            chatList: {
                $each: [
                    {
                        receiverId: req.user._id,
                        msgId: msgId
                    }
                ],
                $position: 0
            }
        }
    })

};

module.exports = { updateChatList };