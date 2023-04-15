const { responsePresenter } = require('../../config/reponse.config');
const { responseMeta } = require('../../config/meta.config');

function validateInputAccount(req, res, next) {
    if (!req.body.name) {
        throw responsePresenter(
            null,
            responseMeta('Name not exist', 400, HTTP_RESPONSE['400'])
        )
    }
    if (!req.body.password){
        throw responsePresenter(
            null,
            responseMeta('Password not exist', 400, HTTP_RESPONSE['400'])
        )
    }
    if (NAME_ACCOUNT_REGEX.test(req.body.name)) {
        next();
    }
    throw responsePresenter(
            null,
            responseMeta('Name only have letters or numbers', 400, HTTP_RESPONSE['400'])
        )
}

module.exports = {
    validateInputAccount
}