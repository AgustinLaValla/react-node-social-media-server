const privateChat = (io) => {
    io.on('connection', (client) => {

        client.on('set_private_room', ({ userId }) =>
            client.join(userId));

        client.on('refresh_chat', ({ senderId, receiverId }) => io.to(senderId).to(receiverId).emit('refresh_chat'));

        client.on('start_typing', (data) => io.to(data.receiver).emit('is_typing', { ...data, typing: true }));
        client.on('stop_typing', data => io.to(data.receiver).emit('is_typing', { ...data, typing: false }));

        client.on('leave_private_room', ({ userId }) => {
            client.leave(userId);

        });

        client.on('userProfileRoom', ({ userProfileRoom }) =>
            client.join(userProfileRoom));

        client.on('refresh_userVisited_post', ({ postId, userProfileRoom }) =>
            io.to(userProfileRoom).emit('refresh_userVisited_post', { postId }));

        client.on('leaveProfileRoom', ({ userProfileRoom }) => client.leave(userProfileRoom));
    });
};

module.exports = { privateChat };