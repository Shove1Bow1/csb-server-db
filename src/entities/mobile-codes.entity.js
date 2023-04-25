const { Schema,Model } = require('../../config/mongoose.config')
const MobileCodes=new Schema({
    providerId:{
        type:Number,
        name:"providerId"
    },
    code:{
        type: String,
        name:"code",
    }
})
const MobileCodesSchema=Model('mobile_codes',MobileCodes);
module.exports={
    MobileCodesSchema
}