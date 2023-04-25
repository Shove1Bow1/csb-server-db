const { router } = require('../../config/express-custom.config');
const { checkAuthorization, checkJWTToken } = require('../middlewares/authorize.middleware');
const { findAllReports, getAllReportNumbers, getReportInFiveMonth, getReportsByMonthSer } = require('../services/phone-number.service');
const { getMobileCode } = require('../services/mobile-code.service');
const { responsePresenter } = require('../../config/reponse.config');
const { validateQueryLimitPage } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');
const { HTTP_RESPONSE } = require('../enum/http.enum');

// router.get('/reports', [checkAuthorization, getMobileCode, findAllReports], (req, res) => {
//     res.status('200').send(req.result);
// })
router.get('/reports', [checkJWTToken], async (req, res) => {
    try {
        const chartFiveMonth = await getReportInFiveMonth();
        return res.send(responsePresenter(
            chartFiveMonth
        ));
    }
    catch (error) {
        logError(error,'/reports')
        return res.send(
            responsePresenter(
                null,
                responseMeta(error.message, error.status, HTTP_RESPONSE[String(error.status)])
            )
        );
    }
})
router.get('/reports/:year/:month',[checkJWTToken,validateQueryLimitPage],async (req,res)=>{
    try{
        const {month,year}=req.param;
        const {page, limit}=req.query;
        if(!month||!Number.isInteger(month)||!year||!Number.isInteger(year)){
            return res.send(responsePresenter(
                null,
                responseMeta('Month is not a number', 400, HTTP_RESPONSE['400'])
            ));
        }
        const listReportsByMonth=await getReportsByMonthSer(month,year,page,limit);
        return res.send(
            responsePresenter(
                listReportsByMonth
            )
        )
    }
    catch(error){
        logError(error,'/reports/:year/:month')
        return res.send(responsePresenter(
            null,
            responseMeta(error.message, error.status, HTTP_RESPONSE[String(error.status)])
        ))
    }
})
router.get(':phoneNumber/reports',[checkAuthorization, validateQueryLimitPage], async (req,res)=>{
    try{
        const {phoneNumber}=req.param;
        const stringPhone= String(phoneNumber);
        if(!phoneNumber||stringPhone.length>10){
            throw {message: "phoneNumber is not valid", status: "400"};
        }
        
    }
    catch(error){
        logError(error,':phoneNumber/reports/')
        return res.send(responsePresenter(
            null,
            responseMeta(error.message, error.status, HTTP_RESPONSE[String(error.status)])
        ))
    }
})
module.exports = router;