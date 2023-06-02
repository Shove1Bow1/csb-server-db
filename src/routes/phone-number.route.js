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
  getTop10SpammerByTopReports,
  suggestSearching,
  identicalCall,
  detailPhone,
  top10SpammerRecentReports,
  getCreatedPhoneNumbersIn6Month,
  trackingOfflineCalls,
  updateStatusFromAdmin,
  updateStateUnban } = require('../services/phone-number.service');
const { getMobileCodeId } = require('../services/mobile-code.service');
const { responsePresenter } = require('../../config/reponse.config');
const { validateQueryLimitPage,
  validateReportInput,
  validateOfflineCalls } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');
const { responseMeta } = require('../../config/meta.config');
const { encryptMobileDevice } = require('../utils/encrypt');
const { clientRedis } = require('../../config/redis.config');

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

router.get('/spammers/top-ten/top-reports', [checkAuthorization], async (req, res) => {
  try {
    const result = await getTop10SpammerByTopReports();
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
    logError(error, '/spammer/top-ten/top-reports \nmethod: GET');
    throw res.status(Number(error.status)).send(
      responsePresenter(
        null,
        responseMeta(HTTP_RESPONSE[error.status], status, message)
      )
    )
  }
})

router.get('/spammers/top-ten/recent-reports', [checkAuthorization], async (req, res) => {
  try {
    const result = await top10SpammerRecentReports();
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
    logError(error, '/spammers/top-ten/recent-reports \nmethod: GET');
    throw res.status(Number(error.status)).send(
      responsePresenter(
        null,
        responseMeta(HTTP_RESPONSE[error.status], status, message)
      )
    )
  }
})
router.get('/:phoneNumber/suggest/:type', [checkAuthorization], async (req, res) => {
  try {
    const { phoneNumber, type } = req.params;
    if (!phoneNumber || phoneNumber.length > 10) {
      throw { message: 'phone number not exist', status: '404' };
    }
    const result = await suggestSearching(phoneNumber, type ? type : 1);
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
    logError(error, '/:phoneNumber/suggest/:type \nmethod: GET');
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
      throw { message: 'phone number not exist', status: '404' };
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
    logError(error, '/:phoneNumber/incoming-call \nmethod: GET');
    return res.status(Number(status)).send(
      responsePresenter(
        null,
        responseMeta(HTTP_RESPONSE[status], status, message)
      )
    )
  }
})

router.get("/detail/:id", [checkAuthorization], async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw { message: "not id", status: "400" };
    }
    const result = await detailPhone(id);
    return res.send(responsePresenter(result, responseMeta()));
  } catch (error) {
    let { message, status } = error;
    if (!status) {
      message = "";
      status = "500";
    }
    logError(error, "/:phoneNumber/detail \nmethod: GET");
    return res
      .status(Number(status))
      .send(
        responsePresenter(
          null,
          responseMeta(HTTP_RESPONSE[status], status, message)
        )
      );
  }
});

router.get('/month/:month/year/:year/created/', [checkAuthorization], async (req, res) => {
  try {
    const { year, month } = req.params;
    if (Number.isNaN(year) || Number.isNaN(month)) {
      throw { message: 'year or month must be a number', status: '400' }
    }
    const result = await getCreatedPhoneNumbersIn6Month(Number(month), Number(year));
    return res.send(
      responsePresenter(
        result,
        responseMeta()
      )
    )
  }
  catch (error) {
    let { message, status } = error;
    if (!status) {
      message = "";
      status = "500";
    }
    logError(error, "/month/:month/year/:year/created \nmethod: GET");
    return res
      .status(Number(status))
      .send(
        responsePresenter(
          null,
          responseMeta(HTTP_RESPONSE[status], status, message)
        )
      );
  }
})

router.post('/offline-tracking', [checkAuthorization, validateOfflineCalls], async (req, res) => {
  try {
    const { offlineValues, deviceId } = req.body;
    const deviceEncryptId = encryptMobileDevice(deviceId);
    trackingOfflineCalls(offlineValues, deviceEncryptId);
    return res.status(200).send(
      responsePresenter(
        await getListSpammer(),
        responseMeta()
      )
    )
  }
  catch (error) {
    let { message, status } = error;
    if (!status) {
      message = "";
      status = "500";
    }
    logError(error, "/offline-tracking \nmethod: POST");
    return res
      .status(Number(status))
      .send(
        responsePresenter(
          null,
          responseMeta(HTTP_RESPONSE[status], status, message)
        )
      );
  }
})

router.patch('/detail/:phoneId', [checkJWTToken], async (req, res) => {
  try {
    const { phoneId } = req.params;
    res.send(responsePresenter(
      await updateStatusFromAdmin(phoneId, currentStatus, newStatus),
      responseMeta()
    ));
  }
  catch (error) {
    let { message, status } = error;
    if (!status) {
      message = "";
      status = "500";
    }
    logError(error, "/detail/:phoneId \nmethod: PATCH");
    return res
      .status(Number(status))
      .send(
        responsePresenter(
          null,
          responseMeta(HTTP_RESPONSE[status], status, message)
        )
      );
  }
})

router.patch('/:phoneNumber/unban', [checkAuthorization], async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { reason } = req.body;
    if (!reason) {
      throw { message: "reason not exist", status: "400" }
    }
    return res.send(responsePresenter(
      await updateStateUnban(phoneNumber, true, reason),
      responseMeta()
    ));
  }
  catch (error) {
    let { message, status } = error;
    if (!status) {
      message = "";
      status = "500";
    }
    logError(error, "/:phoneNumber/unban \nmethod: PATCH");
    return res
      .status(Number(status))
      .send(
        responsePresenter(
          null,
          responseMeta(HTTP_RESPONSE[status], status, message)
        )
      );
  }
})
router.get('/unban', [checkAuthorization], async (req, res) => {
  try {
    
  }
  catch (error) {
    let { message, status } = error;
    if (!status) {
      message = "";
      status = "500";
    }
    logError(error, "/unban \nmethod: GET");
    return res
      .status(Number(status))
      .send(
        responsePresenter(
          null,
          responseMeta(HTTP_RESPONSE[status], status, message)
        )
      );
  }
})
module.exports = router;
