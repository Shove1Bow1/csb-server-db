const { responsePresenter } = require('../../config/reponse.config');
const { responseMeta } = require('../../config/meta.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { NAME_ACCOUNT_REGEX } = require('../constant/regex');

function validateInputAccount(req, res, next) {
    console.log(req.body)
    if (!req.body.name) {
        return res.send(responsePresenter(
            null,
            responseMeta('Name not exist', 400, HTTP_RESPONSE['400'])
        ));
    }
    if (!req.body.password) {
        return res.send(responsePresenter(
            null,
            responseMeta('Password not exist', 400, HTTP_RESPONSE['400'])
        ))
    }
    console.log(NAME_ACCOUNT_REGEX.test(req.body.name))
    if (NAME_ACCOUNT_REGEX.test(req.body.name)) {
        next();
    }
    else
    return res.send(responsePresenter(
        null,
        responseMeta('Name only have letters or numbers', 400, HTTP_RESPONSE['400'])
    ))
}

module.exports = {
    validateInputAccount
}