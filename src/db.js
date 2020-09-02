const { connect } = require('mongoose');
const { yellow } = require('colors');
const { config } = require('dotenv');

config();

const DB_URI = process.env.DB_URI;

const connectDb = async () => {
    try {
        await connect(DB_URI, {
            useCreateIndex: true,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify:true
        });
        console.log(`${yellow('DATABASE IS CONNECTED')}`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { connectDb };