const { Schema,Model } = require('../../config/mongoose.config');
const Account=new Schema({
    name:{
        type: String,
        name:"name"
    },
    password:{
        type: String,
        name: "password",
    },
    trustedMachine:[{
        machineIP:{
            type: String,
            name: "machineIP"
        },
        jwtKey:{
            type: String,
            name: "authorizeKey"
        }
    }]
},{timestamps:true});
const AccountSchema=Model('accounts', Account);
module.exports={
    AccountSchema
};