const { server, app } = require('./server');
const { green, magenta } = require('colors');
const { connectDb } = require('./db');

const port = app.get('port');

async function main() {
    try {
        await connectDb();
        await server.listen(port);
        console.log(`${green('Server on Port')}: ${magenta(port)}`);
    } catch (error) {
        console.log(error);
    }
}

main();