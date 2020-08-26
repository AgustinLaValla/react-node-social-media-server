const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const imageRoutes = require('./routes/images.routes');
const postsRoutes = require('./routes/posts.routes');
const cors = require('cors');

const server = express();

//Settings
server.set('port', process.env.PORT || 4000);

//Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors({origin:true, credentials:true}));

//Routes
server.use('/api/auth', authRoutes);
server.use('/api/user', userRoutes);
server.use('/api/images', imageRoutes);
server.use('/api/posts', postsRoutes);

module.exports = { server };