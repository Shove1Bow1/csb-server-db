const { router }= require('../../config/express-custom.config');
const { checkAuthorization } = require('../middlewares/authorize.middleware');
const { findAllReports, getAllReportNumbers } =require('../services/phone-number.service');
const { getMobileCode } =require('../services/mobile-code.service');
router.get('/reports',[checkAuthorization,getMobileCode,findAllReports],(req,res)=>{
    res.status('200').send(req.result);
})
router.get("/:mobileId",[checkAuthorization],(req,res)=>{
    const {mobileId}=req.param;
    return res.status('200').send(getMobileCode(mobileId));
})
module.exports=router;