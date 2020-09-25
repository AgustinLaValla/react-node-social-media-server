const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const imageRoutes = require('./routes/images.routes');
const postsRoutes = require('./routes/posts.routes');
const messagesRotues = require('./routes/messages.routes');
const cors = require('cors');
const { socketStreams } = require('./sockets/streams');
const { privateChat } = require('./sockets/private');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//Settings
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin:true, credentials:true}));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/messages', messagesRotues);

//socket streams
socketStreams(io);
privateChat(io);

module.exports = { app, server };