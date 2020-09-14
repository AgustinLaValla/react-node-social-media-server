const { Router } = require('express');
const { validateToken } = require('../middlewares/authorization');
const { sendMessage, getMessages, markMessagesAsRead } = require('../controllers/message.controller');


const router = Router();

router.get('/get-messages/:senderId/:receiverId', validateToken, getMessages);

router.post('/send-message/:senderId/:receiverId', validateToken, sendMessage);

router.put('/mark-messages/:senderId/:receiverId', validateToken, markMessagesAsRead);

module.exports = router;