const { Schema, Model}=require('../config/mongoose.config');
const PhoneNumbers=new Schema({
    MobileId:{
        require:true,
        type: String,
    },
    ReportList:[{
        deviceId: String,
        content: String,
        reportDate: {
            type:Date,
            default: new Date(),
        }
    }],
    phoneNumber:String,
    status:String,
})
const PhoneNumbersSchema=Model('PhoneNumbers',PhoneNumbers);
module.exports={
    PhoneNumbersSchema,
}