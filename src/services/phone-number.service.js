const { PhoneNumbersSchema } = require("../entities/phone-numbers.entity");
const phoneNumbersSchema = PhoneNumbersSchema;
async function findAllReports(phoneNumber, code) {
    try {
        const result = await phoneNumbersSchema.find({
            where: {
                PhoneNumber: phoneNumber,
                MobileId: code,
            },
        })
        .select('ReportList -_id');
        return result;
    }
    catch (error) {
        throw res.status('401').send(error);
    }
}
async function getAllReportNumbers(){
    try{
        const result=await phoneNumbersSchema.find({
            where:{
                status: "reported"
            }
        })
        return result;
    }
    catch(error){
       throw res.status('400').send(error.message);
    }
}

async function getCurrentMonthReport(){
    const currentDate= new Date();
}
module.exports = {
    findAllReports,
    getAllReportNumbers,
}