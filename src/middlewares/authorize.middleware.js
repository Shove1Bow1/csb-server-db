const { jwt } = require('../../config/jwt.config');
const { responseMeta } = require('../../config/meta.config');
const { responsePresenter } = require('../../config/reponse.config');
const { JWT_KEY, AUTHORIZATION_CODE } = require('../constant/env');
const { HTTP_RESPONSE } = require('../enum/http.enum')

function checkAuthorization(req, res, next) {
    if (req.headers.authorization !== AUTHORIZATION_CODE)
        return res.status('400').send(
            responsePresenter(
                null,
                responseMeta(
                    'Unauthorized token',
                    400,
                    HTTP_RESPONSE['400']
                )
            )
        );
    next();
}

function checkJWTToken(req, res, next) {

    if (jwt.verify(String(req.headers.token), JWT_KEY)){
        next();
    }
    else
        return res.status('400').send(
            responsePresenter(
                null,
                responseMeta(
                    'Unauthorized token',
                    400,
                    HTTP_RESPONSE['400']
                )
            )
        );
}

module.exports = {
    checkAuthorization,
    checkJWTToken,
}