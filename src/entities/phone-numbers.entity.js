const { Schema, Model } = require('../../config/mongoose.config');
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
    }
}, { timestamps: true });
const PhoneNumbersSchema = Model('phone_numbers', PhoneNumbers);
PhoneNumbersSchema.createIndexes({
    phoneNumber: "text"
})
module.exports = {
    PhoneNumbersSchema,
};