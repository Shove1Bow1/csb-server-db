const { jwt } = require('../../config/jwt.config');
const { responseMeta } = require('../../config/meta.config');
const { responsePresenter } = require('../../config/reponse.config');
const { JWT_KEY, AUTHORIZATION_CODE } = require('../constant/env');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { getJWTKey, deleteJWTKey } = require('../services/account.service');

function checkAuthorization(req, res, next) {
    if (req.headers.authorization !== AUTHORIZATION_CODE)
        return res.status('401').send(
            responsePresenter(
                null,
                responseMeta(
                    'Unauthorized token',
                    401,
                    HTTP_RESPONSE['401']
                )
            )
        );
    next();
}

async function checkJWTToken(req, res, next) {
    try {
        const { token } = req.headers;
        const machineIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const { name } = jwt.decode(String(token)) || "unknown";
        const jwtKey = await getJWTKey(name, machineIP) || "unknown";
        if (!jwtKey) {
            return res.status('401').send(
                responsePresenter(
                    null,
                    responseMeta(
                        'Not trusted machine',
                        401,
                        HTTP_RESPONSE['401']
                    )
                )
            );
        }
        if (!jwt.verify(String(token), jwtKey)) {
            deleteJWTKey(name, machineIP);
            return res.status('400').send(
                responsePresenter(
                    null,
                    responseMeta(
                        'Unauthorized token',
                        401,
                        HTTP_RESPONSE['401']
                    )
                )
            );
        }
        next();
    }
    catch(error){
        res.status(500).send(
            responsePresenter(
                null,
                responseMeta(HTTP_RESPONSE['500'],500,'')
            )
        )
    }
}

module.exports = {
    checkAuthorization,
    checkJWTToken,
};