const {MobileCodesSchema}= require('../entities/mobile-codes.entity');
const mobileCodeSchema= MobileCodesSchema;
async function getMobileCode(req,res,next){
    try{
        const {mobile_id}=req.headers;
        const mobile=await mobileCodeSchema.findOne({Code: mobile_id})|| "123";
        if(!mobile)
            throw new Error('fuck you');
        else{
            req.code=mobile.Code || "Hoang pro";
            next();
        }
    }
    catch(error){
       return res.status('404').send(error.message);
    }
}
module.exports={
    getMobileCode,
}