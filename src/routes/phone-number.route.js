const { router } = require('../../config/express-custom.config');
const { checkAuthorization,
    checkJWTToken } = require('../middlewares/authorize.middleware');
const { findAllReports,
    getAllReportNumbers,
    getReportInFiveMonth,
    getReportsByMonthSer,
    getReportsByPhoneNumber,
    getCodeAndSevenNumber,
    createReport,
    getListSpammer,
    getTop10SpammerSer,
    suggestSearching,
    identicalCall } = require('../services/phone-number.service');
const { getMobileCodeId } = require('../services/mobile-code.service');
const { responsePresenter } = require('../../config/reponse.config');
const { validateQueryLimitPage,
    validateReportInput } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { responseMeta } = require('../../config/meta.config');
const { encryptMobileDevice } = require('../utils/encrypt');

router.get('/reports', [checkJWTToken], async (req, res) => {
    try {
        const chartFiveMonth = await getReportInFiveMonth();
        return res.send(responsePresenter(
            chartFiveMonth,
            responseMeta()
        ));
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        logError(error, '/reports \nmethod: GET')
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
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        logError(error, '/reports/:year/:month \nmethod: GET');
        return res.status(String(error.status)).send(responsePresenter(
            null,
            responseMeta(HTTP_RESPONSE[status], status, message)
        ));
    }
})

router.get('/:phoneNumber/reports', [checkAuthorization, validateQueryLimitPage], async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const { page, limit } = req;
        const { sevenNumber, mobileCode } = getCodeAndSevenNumber(phoneNumber);
        const mobileCodeId = await getMobileCodeId(mobileCode);
        const reports = await getReportsByPhoneNumber(mobileCodeId, sevenNumber, page, limit);
        return res.status(String(error.status)).send(responsePresenter(
            reports,
            responseMeta()
        ));
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500'
        }
        logError(error, '/:phoneNumber/reports/ \nmethod: GET');
        return res.status(Number(status)).send(responsePresenter(
            null,
            responseMeta(HTTP_RESPONSE[status], status, message)
        ));
    }
})

router.post('/:phoneNumber/reports', [checkAuthorization, validateReportInput], async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const { sevenNumber, mobileCode } = getCodeAndSevenNumber(phoneNumber);
        const mobileCodeId = await getMobileCodeId(mobileCode);
        const { content, title, deviceId } = req.body;
        const report = {
            phoneNumber,
            mobileCodeId: mobileCodeId,
            content,
            title,
            deviceId: encryptMobileDevice(deviceId)
        }
        await createReport(report);
        return res.send(
            responsePresenter(
                'Create report success',
                responseMeta()
            )
        );
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        logError(error, ':phoneNumber/reports/ \nmethod: POST');
        return res.status(Number(status)).send(responsePresenter(
            null,
            responseMeta(HTTP_RESPONSE[error.status], status, message)
        ))
    }
})

router.get('/spammers', [checkAuthorization], async (req, res) => {
    try {
        return res.send(
            responsePresenter(
                await getListSpammer(),
                responseMeta()
            )
        );
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        logError(error, '/spammer \nmethod: GET');
        throw res.status(Number(status)).send(responsePresenter(
            null,
            responseMeta(HTTP_RESPONSE[status], status, message)
        ))
    }
})

router.get('/spammers/top-ten', [checkAuthorization], async (req, res) => {
    try {
        const result = await getTop10SpammerSer();
        return res.send(
            responsePresenter(
                result,
                responseMeta()
            )
        );
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        logError(error, '/spammer \nmethod: GET');
        throw res.status(Number(error.status)).send(
            responsePresenter(
                null,
                responseMeta(HTTP_RESPONSE[error.status], status, message)
            )
        )
    }
})

router.get('/:phoneNumber/suggest', [checkAuthorization], async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        if (!phoneNumber || phoneNumber.length >= 10) {
            throw { message: 'phone number not exist', status: '400' };
        }
        const result = await suggestSearching(phoneNumber);
        return res.send(
            responsePresenter(
                result,
                responseMeta()
            )
        );
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        console.log(error);
        logError(error, '/:phoneNumber/suggest \nmethod: GET');
        return res.status(Number(status)).send(
            responsePresenter(
                null,
                responseMeta(HTTP_RESPONSE[status], status, message)
            )
        )
    }
})
router.get('/:phoneNumber/incoming-call', [checkAuthorization], async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        if (!phoneNumber || phoneNumber.length !== 10) {
            throw { message: 'phone number not exist', status: '400' };
        }
        return res.send(
            responsePresenter(
                await identicalCall(phoneNumber),
                responseMeta(),
            )
        )
    }
    catch (error) {
        let { message, status } = error;
        if (!status) {
            message = '';
            status = '500';
        }
        console.log(error);
        logError(error, '/:phoneNumber/incoming-call \nmethod: GET');
        return res.status(Number(status)).send(
            responsePresenter(
                null,
                responseMeta(HTTP_RESPONSE[status], status, message)
            )
        )
    }
})
module.exports = router;