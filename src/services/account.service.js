const { responseMeta } = require("../../config/meta.config");
const { responsePresenter } = require("../../config/reponse.config");
const { AccountSchema } = require("../entities/account.entity");
const { HTTP_RESPONSE } = require("../enum/http.enum");
const { encryptToJWT, encryptPassword } = require("../utils/encrypt");

async function checkAccount(req,res,next){
    const password=encryptPassword(req.body.password);
    const account =await AccountSchema.findOne({
        $where:{
            name:req.body.name,
            password: password
        }
    })
    if(account){
        req.jwtToken=encryptToJWT(req.name);
        next();
    }
    return res.status(404).send(
        responsePresenter(
            null,
            responseMeta('Name or Password is not correct',404,HTTP_RESPONSE['404'])
        )
    )
}

function checkNameAccount(req,res,next){
    if(!req.body.name){
        return res.status(400).send(
            responsePresenter(
                null,
                responseMeta('Name not exist',400,HTTP_RESPONSE['400'])
            )
        )
    }
    if(NAME_ACCOUNT_REGEX.test(req.body.name)){
        next();
    }
    return res.status(400).send(
        responsePresenter(
            null,
            responseMeta('Name only have letters or numbers',400,HTTP_RESPONSE['400'])
        )
    )
}
module.exports={
    checkAccount,
    checkNameAccount
}