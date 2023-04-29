const { Schema,Model } = require('../../config/mongoose.config');
const MobileCodes=new Schema({
    _id:{
        type: Number,
        name:"_id"
    },
    providerId:{
        type:Number,
        name:"providerId"
    },
    code:{
        type: String,
        name:"code",
        index: true
    }
});
const MobileCodesSchema=Model('mobile_codes',MobileCodes);
module.exports={
    MobileCodesSchema
};