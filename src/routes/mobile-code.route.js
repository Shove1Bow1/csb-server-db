const { responseMeta } = require('../../config/meta.config');
const { responsePresenter } = require('../../config/reponse.config');
const { getMobileCode } = require('../services/mobile-code.service');
const router = require('./account.route');
router.get("/:mobileId", [checkAuthorization], (req, res) => {
    try {
        const { mobileId } = req.param;
        return res.status('200').send(
            responsePresenter(
                getMobileCode(getMobileCode),
                responseMeta()
            )
        );
    }
    catch(error){
        return error;
    }
})
module.exports= router;