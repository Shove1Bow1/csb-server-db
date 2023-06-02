const { responseMeta } = require("../../config/meta.config");
const { responsePresenter } = require("../../config/reponse.config");
const { AccountSchema } = require("../entities/account.entity");
const { HTTP_RESPONSE } = require("../enum/http.enum");
const { encryptToJWT, encryptPassword } = require("../utils/encrypt");

async function checkAccount(name, password) {
    const passwordEncryption = encryptPassword(password);
    const account = await AccountSchema.findOne({
        name,
        passwordEncryption
    })
    if (account) {
        return encryptToJWT(name);
    }
    throw responsePresenter(
        null,
        responseMeta( HTTP_RESPONSE['404'], 404,'Name or Password is not correct')
    )
}

module.exports = {
    checkAccount,
}