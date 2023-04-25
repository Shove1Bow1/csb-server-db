const { getQuanityReportInFiveMonth, getReportsByMonth } = require("../aggregations/phone-numbers.aggreation");
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
async function getAllReportNumbers() {
    try {
        const result = await phoneNumbersSchema.find({
            where: {
                status: "reported"
            }
        })
        return result;
    }
    catch (error) {
        throw error;
    }
}

async function getReportInFiveMonth() {
    try {
        const result=await getQuanityReportInFiveMonth();
        console.log(result);
        return result;
    }
    catch (error) {
        throw error;
    }
}

async function getReportsByMonthSer(month, year, page, limit){
    try{
        const reportsByMonth=await getReportsByMonth(month, year, page, limit);
        return reportsByMonth? reportsByMonth : [];
    }
    catch(error){
        throw error;
    }
}
module.exports = {
    findAllReports,
    getAllReportNumbers,
    getReportInFiveMonth,
    getReportsByMonthSer
}