const { getQuanityReportInFiveMonth, getReportsByMonth, getListReportsByPhoneNumber, getListSpammerAgg } = require("../aggregations/phone-numbers.aggreation");
const { LIST_STATUS, SCAMMER, POTENTIAL_SCAMMER } = require("../constant/value");
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
        const result = await getQuanityReportInFiveMonth();
        console.log(result);
        return result;
    }
    catch (error) {
        throw error;
    }
}

async function getReportsByMonthSer(month, year, page, limit) {
    try {
        const reportsByMonth = await getReportsByMonth(month, year, page, limit);
        return reportsByMonth ? reportsByMonth : [];
    }
    catch (error) {
        throw error;
    }
}

async function getReportsByPhoneNumber(mobileCodeId, phoneNumber, page, limit) {
    try {
        const reportsByPhoneNumber = await getListReportsByPhoneNumber(mobileCodeId, phoneNumber, page, limit);
        return reportsByPhoneNumber ? reportsByPhoneNumber : [];
    }
    catch (error) {
        throw error;
    }
}

function getCodeAndSevenNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length > 10) {
        throw { message: "phone number is not valid", status: "400" };
    }
    const mobileCode = phoneNumber[0] + phoneNumber[1] + phoneNumber[2];
    const sevenNumber = phoneNumber[3] + phoneNumber[4] + phoneNumber[5] + phoneNumber[6] + phoneNumber[7] + phoneNumber[8] + phoneNumber[9];
    return {
        mobileCode,
        sevenNumber
    };
}

async function createReport({ phoneNumber, mobileCodeId, content, title, deviceId }) {
    const existNumber = await PhoneNumbersSchema.find({
        phoneNumber,
        mobileCodeId,
    })
    if (existNumber[0]) {
        const deviceExist = await PhoneNumbersSchema.find({
            phoneNumber,
            mobileCodeId,
            'reportList.deviceCodeId': deviceId
        })
        if (!deviceExist[0]) {
            return await PhoneNumbersSchema.updateOne({
                phoneNumber,
                mobileCodeId,
            }, {
                $set:{"status": await updateStatus(existNumber[0])},
                $push: {
                    reportList: {
                        deviceCodeId: deviceId,
                        title,
                        content,
                        reportDate: new Date(),
                    }
                },
            })
        }
        throw { message: 'This device already reported number - conflict happen', status: '409' }
    }
    return await PhoneNumbersSchema.create({
        phoneNumber,
        mobileCodeId,
        reportList: [{
            deviceCodeId: deviceId,
            title,
            content,
            reportDate: new Date()
        }],
        isDelete: false,
        status: LIST_STATUS[0],
    })
}

async function updateStatus(existNumber) {
    const numberOfReports = await existNumber.reportList.length+1;
    if (await numberOfReports < POTENTIAL_SCAMMER){
         return LIST_STATUS[0];
    }
    if (await numberOfReports >= POTENTIAL_SCAMMER && await numberOfReports < SCAMMER) {
        return LIST_STATUS[1];
    }
    return LIST_STATUS[2];
}

async function getListSpammer(){
    const result= await getListSpammerAgg();
    return result? result: {};
}
module.exports = {
    findAllReports,
    getAllReportNumbers,
    getReportInFiveMonth,
    getReportsByMonthSer,
    getReportsByPhoneNumber,
    getCodeAndSevenNumber,
    createReport,
    getListSpammer
};