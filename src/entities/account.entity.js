const { Schema,Model } = require('../../config/mongoose.config')
const Account=new Schema({
    name:{
        type: String,
        name:"name"
    },
    password:{
        type: String,
        name: "password",
    }
},{timestamps:true})
const AccountSchema=Model('accounts', Account);
module.exports={
    AccountSchema
}