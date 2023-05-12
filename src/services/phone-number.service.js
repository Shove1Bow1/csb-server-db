const { client } = require("../../config/redis.config");
const { getQuanityReportInFiveMonth,
        getReportsByMonth,
        getListReportsByPhoneNumber,
        getListSpammerAgg,
        getTop10SpammerReports } = require("../aggregations/phone-numbers.aggreation");
const { LIST_STATUS, SPAMMER, POTENTIAL_SPAMMER } = require("../constant/value");
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
            .select('reportList -_id');
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
    const timeReport = new Date();
    if (existNumber[0]) {
        const deviceExist = await PhoneNumbersSchema.find({
            phoneNumber,
            mobileCodeId,
            'reportList.deviceCodeId': deviceId
        })
        if (!deviceExist[0]) {
            setQueueReport(deviceId, title, content, reportDate, phoneNumber);
            return await PhoneNumbersSchema.updateOne({
                phoneNumber,
                mobileCodeId,
            }, {
                $set: { "status": await updateStatus(existNumber[0]) },
                $push: {
                    reportList: {
                        deviceCodeId: deviceId,
                        title,
                        content,
                        reportDate: timeReport,
                    }
                },
            })
        }
        throw { message: 'This device already reported this number - conflict happen', status: '409' }
    }
    setQueueReport(deviceId, title, content, reportDate, phoneNumber);
    return await PhoneNumbersSchema.create({
        phoneNumber,
        mobileCodeId,
        reportList: [{
            deviceCodeId: deviceId,
            title,
            content,
            reportDate: timeReport
        }],
        isDelete: false,
        status: LIST_STATUS[0],
    })
}

async function updateStatus(existNumber) {
    const numberOfReports = await existNumber.reportList.length + 1;
    if (await numberOfReports < POTENTIAL_SPAMMER) {
        return LIST_STATUS[0];
    }
    if (await numberOfReports >= POTENTIAL_SPAMMER && await numberOfReports < SPAMMER) {
        return LIST_STATUS[1];
    }
    return LIST_STATUS[2];
}

async function getListSpammer() {
    const result = await getListSpammerAgg();
    return result ? result : [];
}

async function getTop10SpammerSer() {
    const result = await getTop10SpammerReports();
    return result ? result : [];
}

async function suggestSearching(phoneNumber) {
    const result = await PhoneNumbersSchema.find({
        phoneNumber: new RegExp(phoneNumber, 'i')
    }, { phoneNumber: 1, status: 1 }, { limit: 10 })
    return result ? result : [];
}

async function identicalCall(phoneNumber) {
    const result = await PhoneNumbersSchema.findOne({
        phoneNumber
    }).select('-reportList')
    return result;
}

async function setQueueReport(deviceId, title, content, reportDate, phoneNumber) {
    const reportKey = deviceId + phoneNumber;
    await client.connect();
    if (await client.isReady()) {
        await client.set(reportKey, JSON.stringify({
            phoneNumber,
            content,
            reportDate,
            title
        }))
        await client.expire(reportKey, 1000 * 3600 * 24 * 7);
        await client.disconnect();
    }
}

async function rejectReport(phoneNumber) {

}
module.exports = {
    findAllReports,
    getAllReportNumbers,
    getReportInFiveMonth,
    getReportsByMonthSer,
    getReportsByPhoneNumber,
    getCodeAndSevenNumber,
    createReport,
    getListSpammer,
    getTop10SpammerSer,
    suggestSearching,
    identicalCall
};