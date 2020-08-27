const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const imageRoutes = require('./routes/images.routes');
const postsRoutes = require('./routes/posts.routes');
const cors = require('cors');
const { socketStreams } = require('./sockets/streams');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//Settings
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin:true, credentials:true}));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/posts', postsRoutes);

//socket streams
socketStreams(io);

module.exports = { app, server };