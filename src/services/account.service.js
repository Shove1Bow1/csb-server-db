const { responseMeta } = require("../../config/meta.config");
const { responsePresenter } = require("../../config/reponse.config");
const { AccountSchema } = require("../entities/account.entity");
const { HTTP_RESPONSE } = require("../enum/http.enum");
const { encryptToJWT, encryptPassword, randomKey } = require("../utils/encrypt");

async function checkAccount(name, password, machineIP) {
    const passwordEncryption = encryptPassword(password);
    console.log(passwordEncryption);
    const jwtKey = randomKey();
    const account = await AccountSchema.findOne({
        name,
        password:passwordEncryption
    })
    if (account) {
        await updateAccount(name, passwordEncryption, machineIP, jwtKey);
        return encryptToJWT(name, jwtKey);
    }
    throw responsePresenter(
        null,
        responseMeta('Name or Password is not correct', 404, HTTP_RESPONSE['404'])
    )
}

async function updateAccount(name, password, machineIP, jwtKey) {
    await AccountSchema.updateOne({
        name,
        password
    }, {
        $push: {
            trustedMachine: {
                machineIP,
                jwtKey,
            }
        }
    });
}

async function getJWTKey(name, machineIP){
    const result=await AccountSchema.findOne({
        name,
        "trustedMachine.machineIP":machineIP
    })
    const jwtKey=result?.trustedMachine[0].jwtKey;
    return jwtKey;
}
async function deleteJWTKey(name, machineIP){
    await AccountSchema.update({
        name,
        machineIP
    },{$pull:{trustedMachine:""}})
}
module.exports = {
    checkAccount,
    getJWTKey,
    deleteJWTKey,
}