const { enterRoom, getUser, getUsersConnected, removeUser } = require('../helpers/users');

const socketStreams = (io) => {

    io.on('connection', client => {

        client.on('online', ({ username, userId }) => {
            client.join('global');
            enterRoom(client.id, username, userId,'global');
            const onlineUsers = getUsersConnected();
            io.emit('usersOnline', { onlineUsers });
            setTimeout(()  => io.emit('connected'), 3500);
        });

        client.on('refresh_userData', ({currentUserId, visitedUserId}) => {
            if(currentUserId) {
                io.to(currentUserId).emit('refresh_userData');
            };
            if(visitedUserId) {
                io.to(visitedUserId).emit('refresh_userData');
            }
        });
        client.on('refresh_single_post', ({postId}) => io.emit('refresh_single_post', {postId}));
        client.on('refresh_posts', () => io.emit('refresh_posts'));
        

        client.on('logout', () => {
            const user = removeUser(client.id);
            if (user) {
                const onlineUsers = getUsersConnected();
                io.emit('usersOnline', { onlineUsers });
            }
        });

        client.on('disconnect', () => {
            const user = removeUser(client.id);
            if (user) {
                const onlineUsers = getUsersConnected();
                io.emit('usersOnline', { onlineUsers });
            }
        });

    })
}

module.exports = { socketStreams };