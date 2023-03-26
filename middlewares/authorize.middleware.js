require('dotenv').config();
function checkAuthorization(req,res,next){
    try{
        if(req.headers.authorization!==process.env.AUTHORIZATION_CODE)
        throw new Error('fuck you')
    else
        next();
    }
    catch(error){
       return res.status('400').send(error);
    }
}
module.exports={
    checkAuthorization,
}