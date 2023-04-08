const { ResponseMeta } = require('../config/error-handler.config');
const { ResponsePresenter } = require('../config/reponse.config');
const { HTTP_RESPONSE } = require('../enum/http.enum')

require('dotenv').config();

function checkAuthorization(req, res, next) {
    try {
        if (req.headers.authorization !== process.env.AUTHORIZATION_CODE)
            throw new Error('fuck you')
        else
            next();
    }
    catch (error) {
        return res.status('400').send(
            ResponsePresenter(
                null,
                ResponseMeta(
                    'Not Auhorized',
                    400,
                    HTTP_RESPONSE['400']
                )
            )
        );
    }
}

module.exports = {
    checkAuthorization,
}