const { jwt } = require('../../config/jwt.config');
const { responseMeta } = require('../../config/meta.config');
const { responsePresenter } = require('../../config/reponse.config');
const { JWT_KEY } = require('../constant/env');
const { HTTP_RESPONSE } = require('../enum/http.enum')

require('dotenv').config();

function checkAuthorization(req, res, next) {
    if (req.headers.authorization !== process.env.AUTHORIZATION_CODE)
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
    else
        next();
}

function checkJWTToken(req, res, next) {
    if(jwt.verify(req.token,JWT_KEY))
        next();
    else
        res.status('400').send(
            responsePresenter(
                null,
                responseMeta(
                    'Unauthorized token',
                    400,
                    HTTP_RESPONSE['400']
                )
            )
        )
}
module.exports = {
    checkAuthorization,
}