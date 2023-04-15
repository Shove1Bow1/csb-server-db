const { PhoneNumbersSchema } = require("../entities/phone-numbers.entity");
const phoneNumbersSchema = PhoneNumbersSchema;
async function findAllReports(req, res, next) {
    try {
        const { phone_number } = req.headers;
        const { code } = req;
        const result = await phoneNumbersSchema.find({
            where: {
                PhoneNumber: phone_number,
                MobileId: code,
            },
        })
        .select('ReportList -_id');
        req.result = result;
        next();
    }
    catch (error) {
        res.status('401').send(error);
    }
}
async function getAllReportNumbers(req,res,next){
    try{
        const result=await phoneNumbersSchema.find({
            where:{
                status: "reported"
            }
        })
        req.result=result;
        next()
    }
    catch(error){
        res.status('400').send(error.message);
    }
}

async function getCurrentMonthReport(){
    const currentDate= new Date();
}
module.exports = {
    findAllReports,
    getAllReportNumbers,
}