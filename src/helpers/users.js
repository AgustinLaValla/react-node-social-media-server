let globalRoom = [];

const enterRoom = (socketId, username, userId,room) => {
    const user = { id: socketId, name: username.trim().toLowerCase(), room, userId };
    globalRoom.push(user);
    return { user };
}

const getUser = (socketId) => globalRoom.find(user => user.id === socketId);

const removeUser = (socketId) => {
    const userIndex = globalRoom.findIndex(user => user.id === socketId);
    if(userIndex > -1) {
        return globalRoom.splice(userIndex, 1)[0];
    }
}

const getUsersConnected = () =>  [...new Set(globalRoom.map(user => user.userId))];

module.exports = { enterRoom, getUser, removeUser, getUsersConnected };