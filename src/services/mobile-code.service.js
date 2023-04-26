const {MobileCodesSchema}= require('../entities/mobile-codes.entity');
const mobileCodeSchema= MobileCodesSchema;
async function getMobileCodeId(mobileCode){
    try{
        const mobile=await mobileCodeSchema.findOne({code: String(mobileCode)});
        if(!mobile)
            throw new Error('fuck you');
        else{
            return mobile._id;
        }
    }
    catch(error){
       return error;
    }
}
module.exports={
    getMobileCodeId,
}