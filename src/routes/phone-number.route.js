const { router } = require('../../config/express-custom.config');
const { checkAuthorization, checkJWTToken } = require('../middlewares/authorize.middleware');
const { findAllReports, getAllReportNumbers, getReportInFiveMonth, getReportsByMonthSer, getReportsByPhoneNumber } = require('../services/phone-number.service');
const { getMobileCode, getMobileCodeId } = require('../services/mobile-code.service');
const { responsePresenter } = require('../../config/reponse.config');
const { validateQueryLimitPage } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { responseMeta } = require('../../config/meta.config');

// router.get('/reports', [checkAuthorization, getMobileCode, findAllReports], (req, res) => {
//     res.status('200').send(req.result);
// })
router.get('/reports', [checkJWTToken], async (req, res) => {
    try {
        const chartFiveMonth = await getReportInFiveMonth();
        return res.send(responsePresenter(
            chartFiveMonth,
            responseMeta()
        ));
    }
    catch (error) {
        logError(error, '/reports')
        return res.send(
            responsePresenter(
                null,
                responseMeta(error.message, error.status, HTTP_RESPONSE[String(error.status)])
            )
        );
    }
})
router.get('/reports/:year/:month', [checkJWTToken, validateQueryLimitPage], async (req, res) => {
    try {
        const { month, year } = req.params;
        const { page, limit } = req;
        const monthNumber = Number(month);
        const yearNumber = Number(year);
        if (!month || !Number.isInteger(monthNumber) || !year || !Number.isInteger(yearNumber)) {
            throw responseMeta('Month is not a number', 400);
        }
        const listReportsByMonth = await getReportsByMonthSer(monthNumber, yearNumber, page, limit);
        return res.send(
            responsePresenter(
                listReportsByMonth,
                responseMeta()
            )
        );
    }
    catch (error) {
        logError(error, '/reports/:year/:month');
        return res.send(responsePresenter(
            null,
            responseMeta(error.message, error.status, HTTP_RESPONSE[String(error.status)])
        ));
    }
})
router.get('/:phoneNumber/reports', [checkAuthorization, validateQueryLimitPage], async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const { page, limit } = req;
        if (!phoneNumber || phoneNumber.length > 10) {
            throw { message: "phone number is not valid", status: "400" };
        }
        const mobileCode = phoneNumber[0] + phoneNumber[1] + phoneNumber[2];
        const sevenNumber = phoneNumber[3] + phoneNumber[4] + phoneNumber[5] + phoneNumber[6] + phoneNumber[7] + phoneNumber[8] + phoneNumber[9];
        const mobileCodeId = await getMobileCodeId(mobileCode);
        const reports = await getReportsByPhoneNumber(mobileCodeId, sevenNumber, page, limit);
        return res.send(responsePresenter(
            reports,
            responseMeta()
        ));
    }
    catch (error) {
        logError(error, ':phoneNumber/reports/');
        return res.send(responsePresenter(
            null,
            responseMeta(error.message, error.status, HTTP_RESPONSE[String(error.status)])
        ));
    }
})
module.exports = router;