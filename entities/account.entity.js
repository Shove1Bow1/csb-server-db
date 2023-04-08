const { Schema,Model } = require('../config/mongoose.config')
const Account=new Schema({
    name:{
        type:String,
        name:"name"
    },
    Password:{
        type: String,
        name:"password",
    }
})
const MobileCodesSchema=Model('MobileCodes',MobileCodes);
module.exports={
    MobileCodesSchema
}