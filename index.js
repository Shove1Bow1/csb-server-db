require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { createServer } = require("http");

const app = express();
const Schema = mongoose.Schema;
const Model = mongoose.model;
const httpServer = createServer(app);
const io = new Server(httpServer);
mongoose.connect(process.env.DATABASE_URI, { dbName: "call_spam_blocker" });
io.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
        socket.join(data.myId);
    })
})
const db = mongoose.connection;

app.use(bodyParser.json());
const PhoneNumbers = new Schema({
    mobileCodeId: {
        require: true,
        type: Number,
        name: 'mobileCodeId'
    },
    reportList: [{
        deviceCodeId: {
            type: String,
            name: 'deviceCodeId',
            index: true
        },
        content: {
            type: String,
            name: 'content',
        },
        reportDate: {
            type: Date,
            default: new Date(),
            name: 'reportDate',
            index: true,
        },
        title: {
            type: String,
            name: 'title',
        },
    }],
    phoneNumber: {
        type: String,
        name: 'phoneNumber',
        index: true
    },
    callTracker: [{
        dateTracker: {
            type: String,
            name: 'dateTracker',
            index: true,
        },
        numberOfCall: {
            type: Number,
            name: 'numberOfCall',
            index: true,
        }
    }],
    status: {
        type: String,
        default: 'reported',
        name: 'status',
        index: true
    },
    isDelete: {
        type: Boolean,
        default: false,
        name: 'isDelete'
    },
    wasUpdated: {
        type: Boolean,
        default: false,
        name: 'wasASpammer'
    }
}, { timestamps: true });
const PhoneNumbersSchema = mongoose.model("phone_numbers", PhoneNumbers)
PhoneNumbersSchema.watch().on('change', async (number) => {
    if (number) {
        const phoneNumber = number.documentKey.phoneNumber;
        const isSpammer = await PhoneNumbersSchema.find({ phoneNumber }).select("status");
        if(isSpammer.status==='spammer'){
            io.to(phoneNumber).emit('changes',phoneNumber)
        }
    }

});
// PhoneNumbersSchema.watch().on("change",(change)=>{
//     console.log(change);
// });
httpServer.listen(process.env.PORT);