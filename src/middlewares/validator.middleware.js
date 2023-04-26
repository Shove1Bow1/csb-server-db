const { responsePresenter } = require('../../config/reponse.config');
const { responseMeta } = require('../../config/meta.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { NAME_ACCOUNT_REGEX } = require('../constant/regex');
const { query } = require('express');

function validateInputAccount(req, res, next) {
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
    if (NAME_ACCOUNT_REGEX.test(req.body.name)) {
        next();
    }
    else
    return res.send(responsePresenter(
        null,
        responseMeta('Name only have letters or numbers', 400, HTTP_RESPONSE['400'])
    ))
}
function validateQueryLimitPage(req,res,next){
    const {limit,page}=req.query;
    if(!limit||!page){
        return res.send(responsePresenter(
            null,
            responseMeta('Limit or Page not exists', 400, HTTP_RESPONSE['400'])
        ));
    }
    const limitConvert=Number(limit);
    const pageConvert=Number(page);
    if(!Number.isInteger(limitConvert)||!Number.isInteger(pageConvert)){
        return res.send(responsePresenter(
            null,
            responseMeta('Limit or Page is not a number', 400, HTTP_RESPONSE['400'])
        ));
    }
    req.limit=limitConvert;
    req.page=pageConvert;
    next();
}
module.exports = {
    validateInputAccount,
    validateQueryLimitPage,
}