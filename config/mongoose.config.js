require('dotenv').config();
var debug = require('debug')('call-spam-blocker-server:server');
const mongoose = require('mongoose');
try {
    mongoose.connect(process.env.MONGOOSE_URI, { dbName: 'call_spam_blocker' }).catch(error => { throw error });
    if (mongoose.connection.readyState === 1) {
        debug('Mongodb connected');
    }
    if (mongoose.connection.readyState === 2) {
        debug('Attempt to connect to MongoDB');
        setTimeout(()=>{
            debug('Connect Successfully');
        },15000);
    }
    else {
        debug('Can not connect to mongodb');
    }
}
catch (error) {
    throw new error;
}

const Schema = mongoose.Schema;
const Model = mongoose.model;
module.exports = {
    Schema,
    Model
};