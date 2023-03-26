const { router }= require('../config/express-custom.config');
const { checkAuthorization } = require('../middlewares/authorize.middleware');
const { findAllReports, getAllReportNumbers } =require('../controllers/phone-number.controller');
const { getMobileCode } =require('../controllers/mobile-code.controller');
router.get('/reports',[checkAuthorization,getMobileCode,findAllReports],(req,res)=>{
    res.status('200').send(req.result);
})
router.get("/",[checkAuthorization,getAllReportNumbers],(req,res)=>{
    res.status('200').send(req.result);
})
module.exports=router;