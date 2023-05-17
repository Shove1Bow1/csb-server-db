const { client } = require("../../config/redis.config");
const { getQuanityReportInFiveMonth,
    getReportsByMonth,
    getListReportsByPhoneNumber,
    getListSpammerAgg,
    getTop10SpammerReports,
    getTotalNumbersCreateIn6Month } = require("../aggregations/phone-numbers.aggreation");
const { CALLS_IN_MONTH } = require("../constant/value");
const { LIST_STATUS, SPAMMER, POTENTIAL_SPAMMER } = require("../constant/value");
const { MobileCodesSchema } = require("../entities/mobile-codes.entity");
const { PhoneNumbersSchema } = require("../entities/phone-numbers.entity");
const { ProvidersSchema } = require("../entities/providers.entity");
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

async function getTop10SpammerByTopReports() {
    const result = await getTop10SpammerReports();
    return result ? result : [];
}

async function suggestSearching(phoneNumber, type) {
    let result = [];
    if (type === '1') {
        result = await PhoneNumbersSchema.find({
            phoneNumber: new RegExp(phoneNumber, 'i'),
        }, { phoneNumber: 1, status: 1 }, { limit: 10 })
    }
    else {
        result = await PhoneNumbersSchema.find({
            phoneNumber: new RegExp(phoneNumber, 'i'),
            status: LIST_STATUS[2]
        }, { phoneNumber: 1, status: 1 }, { limit: 10 })
    }
    return result ? result : [];
}

async function identicalCall(phoneNumber) {
    const result = await PhoneNumbersSchema.findOne({
        phoneNumber
    }).select('-reportList')
    trackingPhoneCalls(phoneNumber,result.status);
    return result;
}

async function setQueueReport(deviceId, title, content, reportDate, phoneNumber) {
    const reportKey = deviceId + phoneNumber;
    await client.connect();
    if (client.isReady) {
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

async function detailPhone(id) {
    const phoneNumber = await PhoneNumbersSchema.findOne({
        _id: id,
    });
    console.log(id);
    const mobileCode = await MobileCodesSchema.findOne({
        _id: phoneNumber.mobileCodeId,
    });
    const provider = await ProvidersSchema.findById({
        _id: mobileCode.providerId,
    });
    return phoneNumber
        ? { ...phoneNumber._doc, ...provider._doc, code: mobileCode.code }
        : {};
}

async function top10SpammerRecentReports() {
    const result = await PhoneNumbersSchema.find({
        status: LIST_STATUS[2],
    }).sort({ updatedAt: -1 }).limit(10).select('-reportList -createdAt -isDelete -__v');
    return result;
}

async function recentCreatedPhoneNumbersIn7Days() {

}

async function getCreatedPhoneNumbersIn6Month(month, year) {
    const result = await getTotalNumbersCreateIn6Month(month, year);
    const total = result[0].count + result[1].count + result[2].count + result[3].count + result[4].count + result[5].count;
    return result ? { total, sixMonth: [...result] } : [];
}

async function trackingPhoneCalls(phoneNumber,status) {
    const temp = new Date();
    const curMonthYear = (temp.getMonth() + 1) + '/' + temp.getFullYear();
    const phoneNumberData = await PhoneNumbersSchema.findOne({
        phoneNumber,
        status: LIST_STATUS[1],
        'callTracker.dateTracker': curMonthYear,
    }).select('-reportList -createdAt -updatedAt');
    if (status === LIST_STATUS[1]) {
        if (phoneNumberData) {
            phoneNumberData.callTracker[0].numberOfCall++;
            if (phoneNumberData.callTracker[0].numberOfCall >= CALLS_IN_MONTH) {
                phoneNumberData.status = LIST_STATUS[2];
            }
            await PhoneNumbersSchema.updateOne({
                phoneNumber,
                'callTracker.dateTracker': curMonthYear,
                status: LIST_STATUS[1],
            }, {  $inc:{'callTracker.$.numberOfCall':1}, 'status': phoneNumberData.status })
        }
        else {
            await PhoneNumbersSchema.updateOne({
                phoneNumber,
                status: LIST_STATUS[1],
            }, {
                $push: {
                    callTracker: {
                        dateTracker: curMonthYear,
                        numberOfCall: 1
                    }
                }
            })
        }
    }

    return 'success';
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
    getTop10SpammerByTopReports,
    suggestSearching,
    identicalCall,
    detailPhone,
    top10SpammerRecentReports,
    getCreatedPhoneNumbersIn6Month
};