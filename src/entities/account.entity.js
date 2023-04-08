const { Schema,Model } = require('../../config/mongoose.config')
const Account=new Schema({
    name:{
        type:String,
        name:"name"
    },
    password:{
        type: String,
        name:"password",
    }
})
const AccountSchema=Model('AccountSchema',Account);
module.exports={
    AccountSchema
}