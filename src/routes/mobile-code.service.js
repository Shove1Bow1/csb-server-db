const { getMobileCode } = require('../services/mobile-code.service');
router.get("/:mobileId", [checkAuthorization], (req, res) => {
    try {
        const { mobileId } = req.param;
        return res.status('200').send(getMobileCode(mobileId));
    }
    catch(error){
        return error;
    }
})