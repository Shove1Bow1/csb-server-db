require('dotenv').config();
const mongoose= require('mongoose')
try{
   mongoose.connect(process.env.MONGOOSE_URI,{dbName:'call_spam_blocker'}).then(()=>{});
   if(mongoose.connection.readyState===1 || mongoose.connection.readyState===2){
        console.log('Mongodb connected');
   }
   else{
    console.log('Can not connect to mongodb')
   }
}
catch(error){
    throw new Error('Bad connection');
}

const Schema=mongoose.Schema;
const Model=mongoose.model;
module.exports={
    Schema,
    Model
}