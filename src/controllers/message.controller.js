const Conversation = require('../schemas/conversation.schema');
const Message = require('../schemas/message.schema');
const User = require('../schemas/user.schema');
const { updateChatList } = require('../helpers/update-chat-list');

const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;
    const conversationId = await Conversation.find().or([
        {
            $and: [
                { 'participants.senderId': senderId },
                { 'participants.receiverId': receiverId }
            ]
        },
        {
            $and: [
                { 'participants.senderId': receiverId },
                { 'participants.receiverId': senderId }
            ]
        }
    ]).select('_id');

    if (conversationId) {
        const messages = await Message.find({ conversationId }).populate('messages.senderId', '_id username picVersion picId img google');
        return res.json({ ok: true, messages })
    }


    return res.json({ ok: true, messages });
}

const sendMessage = async (req, res) => {
    const { senderId, receiverId } = req.params;
    const { receivername, message } = req.body;

    try {

        const conversations = await Conversation.find().or([
            { participants: { $elemMatch: { senderId: senderId, receiverId: receiverId } } },
            { participants: { $elemMatch: { senderId: receiverId, receiverId: senderId } } }
        ]);

        let conversation;

        if (conversations.length > 0) {
            await Message.updateOne({ conversationId: conversations[0]._id }, {
                $push: {
                    messages: {
                        senderId,
                        receiverId,
                        sendername: req.user.username,
                        receivername,
                        body: message,
                        createdAt: new Date()
                    }
                }
            });
            const messageSent = await Message.findOne({ conversationId: conversations[0]._id });
            updateChatList(req, messageSent._id);
            return res.json({ ok: true, message: 'Message Sent' });
        } else {

            conversation = await Conversation.create({
                participants: [{ senderId, receiverId }]
            });

            const newMessage = await Message.create({
                conversationId: conversation._id,
                sender: req.user.username,
                receiver: receivername,
                receiverId,
                messages: [
                    {
                        senderId,
                        receiverId,
                        sendername: req.user.username,
                        receivername,
                        body: message,
                        createdAt: new Date()
                    }
                ]
            });

            await User.updateOne({ _id: req.user._id }, {
                $push: {
                    chatList: {
                        $each: [
                            {
                                receiverId: receiverId,
                                msgId: newMessage._id
                            }
                        ],
                        $position: 0
                    }
                }
            });

            if(req.user._id === receiverId) return;

            await User.updateOne({ _id: receiverId }, {
                $push: {
                    chatList: {
                        $each: [
                            {
                                receiverId: req.user._id,
                                msgId: newMessage._id
                            }
                        ]
                    }
                }
            });

            return res.json({ ok: true, message: 'Message successfully sent' })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
};

const markMessagesAsRead = async (req, res) => {

    const { senderId, receiverId } = req.params;

    try {

        const msgs = await Message.findOne({
            $and: [
                { 'messages.senderId': receiverId, 'messages.receiverId': senderId }
            ]
        });

        msgs.messages.forEach(async message => {

            await Message.updateOne(
                { 'messages._id': message._id },
                { $set: { 'messages.$.isRead': true } }
            );

        });

        return res.json({ ok: true, message: 'messages marked' });

    } catch (error) {
        console.log(error);
    }
};

module.exports = { sendMessage, getMessages, markMessagesAsRead };