const { Schema,Model } = require('../config/mongoose.config')
const MobileCodes=new Schema({
    Provider:{
        type:String,
        name:"provider_id"
    },
    Code:{
        type:"string",
        name:"code",
    }
})
const MobileCodesSchema=Model('MobileCodes',MobileCodes);
module.exports={
    MobileCodesSchema
}