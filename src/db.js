const { connect } = require('mongoose');
const { yellow } = require('colors');

const connectDb = async () => {
    try {
        await connect('mongodb://localhost/react-social-app', {
            useCreateIndex: true,
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log(`${yellow('DATABASE IS CONNECTED')}`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { connectDb };