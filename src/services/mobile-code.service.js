const {MobileCodesSchema}= require('../entities/mobile-codes.entity');
const mobileCodeSchema= MobileCodesSchema;
async function getMobileCode(mobileId){
    try{
        const mobile=await mobileCodeSchema.findOne({Code: mobileId});
        if(!mobile)
            throw new Error('fuck you');
        else{
            return mobile.code;
        }
    }
    catch(error){
       return res.status('404').send(error.message);
    }
}
module.exports={
    getMobileCode,
}