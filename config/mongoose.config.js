require('dotenv').config();
const mongoose = require('mongoose');
const { logError } = require('./fs.config');
try {
    mongoose.connect(process.env.MONGOOSE_URI, { dbName: 'call_spam_blocker' }).catch(error => { throw error });
    if (mongoose.connection.readyState === 1) {
        console.log('Mongodb connected');
    }
    if (mongoose.connection.readyState === 2) {
        console.log('Attempt to connect to MongoDB');
        setTimeout(()=>{
            console.log('Connect Successfully');
        },15000);
    }
    else {
        console.log('Can not connect to mongodb');
    }
}
catch (error) {
    logError(error,'Config Mongodb');
    throw new error;
}

const Schema = mongoose.Schema;
const Model = mongoose.model;
module.exports = {
    Schema,
    Model
};