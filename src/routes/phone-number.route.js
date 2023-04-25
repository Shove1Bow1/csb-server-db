const { router } = require('../../config/express-custom.config');
const { checkAuthorization, checkJWTToken } = require('../middlewares/authorize.middleware');
const { findAllReports, getAllReportNumbers, getFiveMonthReport } = require('../services/phone-number.service');
const { getMobileCode } = require('../services/mobile-code.service');
const { responsePresenter } = require('../../config/reponse.config');

// router.get('/reports', [checkAuthorization, getMobileCode, findAllReports], (req, res) => {
//     res.status('200').send(req.result);
// })
router.get('/reports', [checkJWTToken], async (req, res) => {
    try {
        const chartFiveMonth = await getFiveMonthReport();
        return res.send(responsePresenter(
            chartFiveMonth
        ));
    }
    catch (error) {
        return res.send(error);
    }
})
module.exports = router;