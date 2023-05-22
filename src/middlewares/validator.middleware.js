const { responsePresenter } = require('../../config/reponse.config');
const { responseMeta } = require('../../config/meta.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { NAME_ACCOUNT_REGEX } = require('../constant/regex');

function validateInputAccount(req, res, next) {
    if (!req.body.name) {
        return res.status(400).send(responsePresenter(
            null,
            responseMeta('Name not exist', 400, HTTP_RESPONSE['400'])
        ));
    }
    if (!req.body.password) {
        return res.status(400).send(responsePresenter(
            null,
            responseMeta('Password not exist', 400, HTTP_RESPONSE['400'])
        ))
    }
    if (!NAME_ACCOUNT_REGEX.test(req.body.name)) {
        return res.status(400).send(responsePresenter(
            null,
            responseMeta('Name only have letters or numbers', 400, HTTP_RESPONSE['400'])
        ))
    }
    next();
}

function validateQueryLimitPage(req, res, next) {
    const { limit, page } = req.query;
    if (!limit || !page) {
        return res.send(responsePresenter(
            null,
            responseMeta('Limit or Page not exists', 400, HTTP_RESPONSE['400'])
        ));
    }
    const limitConvert = Number(limit);
    const pageConvert = Number(page);
    if (!Number.isInteger(limitConvert) || !Number.isInteger(pageConvert)) {
        return res.status(400).send(responsePresenter(
            null,
            responseMeta('Limit or Page is not a number', 400, HTTP_RESPONSE['400'])
        ));
    }
    req.limit = limitConvert;
    req.page = pageConvert;
    next();
}

function validateReportInput(req, res, next) {
    const { content, title, deviceId } = req.body;
    if (!content || !title || !deviceId) {
        return res.status(400).send(
            responsePresenter(
                null,
                responseMeta('Content, title or deviceId is not exist', 400, HTTP_RESPONSE['400'])
            )
        );
    }
    if (String(content).length < 20) {
        return res.status(400).send(
            responsePresenter(
                null,
                responseMeta('Character in Content cannot be shorter than 20', 400, HTTP_RESPONSE['400'])
            )
        );
    }
    next();
}

function validateOfflineCalls(req, res, next) {
    try {
        const { offlineCalls,deviceId } = req.body;
        if (deviceId){
            throw {message: 'deviceId not exist in body',error:'404'}
        }
        if (offlineCalls) {
            throw { message: 'offlineCalls is not exist', error: '400' };
        }
        if (!Array.isArray(offlineCalls)) {
            throw { message: 'offlineCalls is not a Array', error: '404' };
        }
        if(!offlineCalls[0]){
            throw {message: 'offlineCalls doesn\'t have index value',error: '400'};
        }
        next();
    }
    catch (error) {
        const { message, status } = error;
        return res.status(Number(status)).send(
            responsePresenter(
                null,
                responseMeta(HTTP_RESPONSE[status], status, message)
            )
        )
    };
}
module.exports = {
    validateInputAccount,
    validateQueryLimitPage,
    validateReportInput,
    validateOfflineCalls,
};