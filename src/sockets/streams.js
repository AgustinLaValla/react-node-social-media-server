const socketStreams = (io) => {
    io.on('connection', client => {
        client.on('refresh_userData', () => io.emit('refresh_userData'));
        client.on('refresh_single_post', () => io.emit('refresh_single_post'));
        client.on('refresh_posts', () => io.emit('refresh_posts'));
    })
}

module.exports = { socketStreams };