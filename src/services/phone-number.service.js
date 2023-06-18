const { clientRedis } = require("../../config/redis.config");
const {
  getQuanityReportInFiveMonth,
  getReportsByMonth,
  getListReportsByPhoneNumber,
  getListSpammerAgg,
  getTop10SpammerReports,
  getTotalNumbersCreateIn6Month,
  getListUnbanAggregate,
} = require("../aggregations/phone-numbers.aggreation");
const { CALLS_IN_MONTH } = require("../constant/value");
const {
  LIST_STATUS,
  SPAMMER,
  POTENTIAL_SPAMMER,
} = require("../constant/value");
const { MobileCodesSchema } = require("../entities/mobile-codes.entity");
const { PhoneNumbersSchema } = require("../entities/phone-numbers.entity");
const { ProvidersSchema } = require("../entities/providers.entity");
const cron = require("node-cron");
const { encryptMobileDevice } = require("../utils/encrypt");
const { getMobileCode, getMobileCodeId } = require("./mobile-code.service");
const { reportWithSlack, requestUnbanNumberWithSlack } = require("../../config/slack.config");
const { csbClient } = require("../../config/elasticsearch.config");
const { ES_PHONE_NUMBERS } = require("../constant/env");
async function findAllReports(phoneNumber, code) {
  try {
    const result = await PhoneNumbersSchema.find({
      where: {
        PhoneNumber: phoneNumber,
        MobileId: code,
      },
    }).select("reportList -_id");
    return result;
  } catch (error) {
    throw res.status("401").send(error);
  }
}

async function getAllReportNumbers() {
  try {
    const result = await PhoneNumbersSchema.find({
      where: {
        status: "reported",
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}

async function getReportInFiveMonth() {
  try {
    const result = await getQuanityReportInFiveMonth();
    return result;
  } catch (error) {
    throw error;
  }
}

async function getReportsByMonthSer(month, year, page, limit) {
  try {
    const reportsByMonth = await getReportsByMonth(month, year, page, limit);
    return reportsByMonth ? reportsByMonth : [];
  } catch (error) {
    throw error;
  }
}

async function getReportsByPhoneNumber(mobileCodeId, phoneNumber, page, limit) {
  try {
    const reportsByPhoneNumber = await getListReportsByPhoneNumber(
      mobileCodeId,
      phoneNumber,
      page,
      limit
    );
    return reportsByPhoneNumber ? reportsByPhoneNumber : [];
  } catch (error) {
    throw error;
  }
}

function getCodeAndSevenNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber.length > 10) {
    throw { message: "phone number is not valid", status: "400" };
  }
  const mobileCode = phoneNumber[0] + phoneNumber[1] + phoneNumber[2];
  const sevenNumber =
    phoneNumber[3] +
    phoneNumber[4] +
    phoneNumber[5] +
    phoneNumber[6] +
    phoneNumber[7] +
    phoneNumber[8] +
    phoneNumber[9];
  return {
    mobileCode,
    sevenNumber,
  };
}

async function createReport({
  phoneNumber,
  mobileCodeId,
  content,
  title,
  deviceId,
}) {
  const existNumber = await PhoneNumbersSchema.find({
    phoneNumber,
    mobileCodeId,
  });
  const timeReport = new Date();
  if (existNumber[0]) {
    const deviceExist = await PhoneNumbersSchema.find({
      phoneNumber,
      mobileCodeId,
      "reportList.deviceCodeId": deviceId,
    });
    if (!deviceExist[0]) {
      reportWithSlack(phoneNumber);
      return await PhoneNumbersSchema.updateOne(
        {
          phoneNumber,
          mobileCodeId,
        },
        {
          $set: { status: await updateStatus(existNumber[0]) },
          $push: {
            reportList: {
              deviceCodeId: deviceId,
              title,
              content,
              reportDate: timeReport,
            },
          },
        }
      );
    }
    throw {
      message: "This device already reported this number - conflict happen",
      status: "409",
    };
  }
  return await PhoneNumbersSchema.create({
    phoneNumber,
    mobileCodeId,
    reportList: [
      {
        deviceCodeId: deviceId,
        title,
        content,
        reportDate: timeReport,
      },
    ],
    isDelete: false,
    status: LIST_STATUS[0],
  });
}

async function updateStatus(existNumber) {
  const numberOfReports = (await existNumber.reportList.length) + 1;
  if ((await numberOfReports) < POTENTIAL_SPAMMER) {
    return LIST_STATUS[0];
  }
  if (
    (await numberOfReports) >= POTENTIAL_SPAMMER &&
    (await numberOfReports) < SPAMMER
  ) {
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
  if (type === "1") {
    result = await PhoneNumbersSchema.find(
      {
        phoneNumber: new RegExp(phoneNumber, "i"),
      },
      { phoneNumber: 1, status: 1 },
      { limit: 10 }
    );
  }
  if (type === "4") {
    result = await PhoneNumbersSchema.find(
      {
        phoneNumber: new RegExp(phoneNumber),
        status: LIST_STATUS[1]
      }
    ).select("-reportList -callTracker")
  }
  if (type === "5") {
    result = await PhoneNumbersSchema.find({
      phoneNumber: new RegExp(phoneNumber),
      status: LIST_STATUS[2]
    }).select("-reportList -callTracker")
  }
  if (type === "3") {
    result = await PhoneNumbersSchema.find(
      {
        phoneNumber: new RegExp(phoneNumber, "i"),
      },
      { phoneNumber: 1, status: 1, reportList: 1, callTracker: 1, wasUpdated: 1, stateUnban: 1 },
      { limit: 50 }
    );
  } else {
    result = await PhoneNumbersSchema.find(
      {
        phoneNumber: new RegExp(phoneNumber, "i"),
        status: LIST_STATUS[2],
      },
      { phoneNumber: 1, status: 1 },
      { limit: 10 }
    );
  }
  return result ? result : [];
}

async function identicalCall(phoneNumber) {
  const result = await PhoneNumbersSchema.findOne({
    phoneNumber,
  }).select("-reportList");
  let statusId = 3;
  if (result) {
    trackingPhoneCalls(phoneNumber, result.status);
    switch (result.status) {
      case LIST_STATUS[0]:
        statusId = 0;
        break;
      case LIST_STATUS[1]:
        statusId = 1;
        break;
      case LIST_STATUS[2]:
        statusId = 2;
        break;
    }
  }
  return statusId;
}

async function setQueueReport(
  deviceId,
  title,
  content,
  reportDate,
  phoneNumber
) {
  const reportKey = deviceId + phoneNumber;
  await client.connect();
  if (client.isReady) {
    await client.set(
      reportKey,
      JSON.stringify({
        phoneNumber,
        content,
        reportDate,
        title,
      })
    );
    await client.expire(reportKey, 1000 * 3600 * 24 * 7);
    await client.disconnect();
  }
}

async function rejectReport(phoneNumber) { }

async function detailPhone(id) {
  const phoneNumber = await PhoneNumbersSchema.findOne({
    _id: id,
  });
  phoneNumber.reportList.reverse();
  const mobileCode = await MobileCodesSchema.findOne({
    _id: phoneNumber.mobileCodeId,
  });
  const provider = await ProvidersSchema.findById({
    _id: mobileCode.providerId,
  }).select("-_id");
  return phoneNumber
    ? { ...phoneNumber._doc, ...provider._doc, code: mobileCode.code }
    : {};
}

async function top10SpammerRecentReports() {
  const result = await PhoneNumbersSchema.find({
    status: LIST_STATUS[2],
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select("-reportList -createdAt -isDelete -__v");
  return result;
}

async function recentCreatedPhoneNumbersIn7Days() { }

async function getCreatedPhoneNumbersIn6Month(month, year) {
  const result = await getTotalNumbersCreateIn6Month(month, year);
  const total =
    result[0].count +
    result[1].count +
    result[2].count +
    result[3].count +
    result[4].count +
    result[5].count;
  const allNumbers = await PhoneNumbersSchema.estimatedDocumentCount();
  return result ? { total, sixMonth: [...result], allNumbers } : [];
}

async function trackingPhoneCalls(phoneNumber, status) {
  const temp = new Date();
  const curMonthYear = temp.getMonth() + 1 + "/" + temp.getFullYear();
  const phoneNumberData = await PhoneNumbersSchema.findOne({
    phoneNumber,
    status: LIST_STATUS[1],
    "callTracker.dateTracker": curMonthYear,
  }).select("-reportList -createdAt -updatedAt");
  if (status === LIST_STATUS[1]) {
    if (phoneNumberData) {
      const callTrackerLength = phoneNumberData.callTracker.length - 1;
      phoneNumberData.callTracker[callTrackerLength].numberOfCall++;
      if (phoneNumberData.callTracker[callTrackerLength].numberOfCall >= CALLS_IN_MONTH) {
        phoneNumberData.status = LIST_STATUS[2];
      }
      await PhoneNumbersSchema.updateOne(
        {
          phoneNumber,
          "callTracker.dateTracker": curMonthYear,
          status: LIST_STATUS[1],
        },
        {
          $inc: { "callTracker.$.numberOfCall": 1 },
          status: phoneNumberData.status,
        }
      );
    } else {
      await PhoneNumbersSchema.updateOne(
        {
          phoneNumber,
          status: LIST_STATUS[1],
        },
        {
          $push: {
            callTracker: {
              dateTracker: curMonthYear,
              numberOfCall: 1,
            },
          },
        }
      );
    }
  }

  return "success";
}

// Thực hiện nhiệm vụ lấy dữ liệu trên redis
// Mỗi lần thực hiện cách nhau 10p30
// Số lần truy vấn gồm 5 keys - mỗi keys là định danh theo deviceId
// Số lần truy vấn trong mỗi keys sẽ lấy theo hash, số lượng lưu trữ theo hash-unknown do data lưu trên redis quy định
// Các trường phải có trong 1 hash bao gồm số điện thoại, content, title, reportDate,
// Key sẽ bị xóa sau khi dữ liệu của key đó được lấy hết
// cron.schedule('30 10 * * * * *', async () => {
//     await clientRedis.connect();
//     if (clientRedis.isReady) {
//         const keys = (await clientRedis.keys('*'));
//         const keysLength = keys.length <= 5 ? keysLength : 5;
//         const ungroupedReports = [];
//         for (let i = 0; i < keysLength; i++) {
//             const deviceData = await clientRedis.hGet(keys[i]);
//             const deviceId = encryptMobileDevice(keys[i]);
//             for (const field in deviceData) {
//                 const value = JSON.parse(deviceData[field]);
//                 ungroupedReports.push({
//                     deviceId,
//                     phoneNumber: value.phoneNumber,
//                     content: value.content,
//                     title: value.title,
//                     reportDate: value.createdAt ? value.createdAt : new Date(),
//                 })
//             }
//             await clientRedis.del(keys[i]);
//         }
//         await clientRedis.quit();
//         if(ungroupedReports[0]){
//             const groupedReports = groupingReports(ungroupedReports);
//             createReports(groupedReports);
//         }
//     }
// })

// // Group các index trong arrayReports có số điện thoại trùng nhau đảm bảo cho mongo
// // lúc insert hay update sẽ không bị overload
// async function groupingReports(ungroupedReports) {
//     var groupedReports = ungroupedReports.reduce((reports, report) => {
//         reports[report.phoneNumber] = reports[report.phoneNumber] || [];
//         reports[report.phoneNumber].push(report);
//         return reports;
//     }, Object.create(null));
//     return groupedReports;
// }

// async function createReports(groupedReports) {
//     for (const phoneNumber in groupedReports) {
//         const isExistPhoneNumber = await PhoneNumbersSchema.findOne({
//             phoneNumber
//         })
//         if (isExistPhoneNumber) {
//             const numberOfReport = isExistPhoneNumber.reportList.length + groupedReports[phoneNumber].length;
//             const status = updateStatus(numberOfReport);
//             await PhoneNumbersSchema.updateOne({
//                 phoneNumber
//             }, {
//                 $push: {
//                     reportList: groupedReports[phoneNumber]
//                 },
//                 $set: {
//                     status
//                 }
//             })
//         }
//         else {
//             const mobileCodeId = getMobileCodeId(phoneNumber.slice(0, 2));
//             await PhoneNumbersSchema.create({
//                 phoneNumber,
//                 mobileCodeId,
//                 reportList: groupedReports[phoneNumber],
//                 isDelete: false,
//                 status: groupedReports[phoneNumber].length < POTENTIAL_SPAMMER ? LIST_STATUS[0] : LIST_STATUS[1],
//             })
//         }
//     }
// }

async function trackingOfflineCalls(offlineCalls, deviceId) {
  const temp = new Date();
  const curMonthYear = (temp.getMonth() + 1) + '/' + temp.getFullYear();
  for (let index = 0; index < offlineCalls.length; index++) {
    const { phone, count } = offlineCalls[index];
    const resultPhoneInfo = await PhoneNumbersSchema.findOne({
      phoneNumber: phone,
      $or: [{ status: LIST_STATUS[1] }, { status: LIST_STATUS[2] }],
    }).select('-reportList');
    if (resultPhoneInfo) {
      const lengthCalls = resultPhoneInfo.callTracker.length;
      if (resultPhoneInfo.callTracker[lengthCalls - 1]?.dateTracker && resultPhoneInfo.callTracker[lengthCalls - 1]?.dateTracker === curMonthYear) {
        const nowTrackingCall = resultPhoneInfo.callTracker[lengthCalls - 1].numberOfCall + count;
        let status = resultPhoneInfo.status;
        if (nowTrackingCall < CALLS_IN_MONTH && resultPhoneInfo.reportList?.length < POTENTIAL_SPAMMER)
          status = LIST_STATUS[1];
        else
          status = LIST_STATUS[2];
        await PhoneNumbersSchema.updateOne({
          phoneNumber: phone,
          "callTracker.dateTracker": curMonthYear,
        }, { $inc: { "callTracker.$.numberOfCall": Number(count) }, status })
      }
      else {
        await PhoneNumbersSchema.updateOne({
          phoneNumber: phone,
        }, {
          $push: {
            callTracker: {
              dateTracker: curMonthYear,
              numberOfCall: count
            }
          }
        })
      }
    }
    else continue;
  }
}

async function updateStatusFromAdmin(phoneNumber) {
  try {
    const result = await PhoneNumbersSchema.updateOne({
      phoneNumber,
      status: LIST_STATUS[2],
      wasUpdated: false,
      stateUnban: true,
    }, {
      status: LIST_STATUS[1], wasUpdated: true,
    })
    if (result.modifiedCount) {
      return 1;
    }
    else {
      return 0;
    }
  }
  catch (error) {
    throw error
  }
}

async function updateStateUnban(phoneNumber, stateUnban, reason) {
  const result = await PhoneNumbersSchema.updateOne({
    phoneNumber,
    status: LIST_STATUS[2],
    wasUpdated: false,
    stateUnban: false
  }, { stateUnban });
  if (result.modifiedCount) {
    requestUnbanNumberWithSlack(phoneNumber, reason);
    return 1;
  }
  return 0;
}

async function getListUnban(limit, page) {
  const result = await getListUnbanAggregate(limit, page);
  return result;
}

async function cancelUnban(phoneNumber) {
  const result = await PhoneNumbersSchema.updateOne({
    phoneNumber,
    stateUnban: true,
    wasUpdated: false
  }, { stateUnban: false })
  if (result.modifiedCount) {
    return 1;
  }
  return 0;
}

async function suggestSearchingES(phoneNumber, type) {
  let result = [];
  if (type === "1") {
    result = await csbClient.search({
      index: ES_PHONE_NUMBERS,
      query: {
        bool: {
          must: [
            {
              wildcard: {
                phoneNumber: phoneNumber + "*"
              }
            },
          ]
        }
      },
      size: 10,
      fields: ["phoneNumber", "status"],
      "_source": false
    })
  }
  if (type === "4") {
    result = await csbClient.search({
      index: ES_PHONE_NUMBERS,
      query: {
        bool: {
          must: [
            {
              wildcard: {
                phoneNumber: phoneNumber + "*"
              }
            },
            {
              match: {
                status: LIST_STATUS[1]
              }
            }
          ]
        }
      },
      size: 10,
      fields: ["phoneNumber", "status"],
      "_source": false
    })
  }
  if (type === "5") {
    result = await PhoneNumbersSchema.find({
      phoneNumber: new RegExp(phoneNumber),
      status: LIST_STATUS[2]
    }).select("-reportList -callTracker")
  }
  if (type === "3") {
    result = await csbClient.search({
      index: ES_PHONE_NUMBERS,
      query: {
        bool: {
          must: [
            {
              wildcard: {
                phoneNumber: phoneNumber + "*"
              }
            },
          ]
        }
      },
      size: 10,
      fields: ["phoneNumber", "status", "reportList", "callTracker", "wasUpdated", "stateUnban"],
      "_source": false
    })
  }
  if(type==="2") {
    result = await csbClient.search({
      index: ES_PHONE_NUMBERS,
      query: {
        bool: {
          must: [
            {
              wildcard: {
                phoneNumber: phoneNumber + "*"
              }
            },
            {
              match: {
                status: LIST_STATUS[2]
              }
            }
          ]
        }
      },
      size: 10,
      fields: ["phoneNumber", "status"],
      "_source": false
    })
  }
  const listSuggest = result ? result.hits.hits.map((phone) => {
    return ({
      phoneNumber: phone.fields.phoneNumber[0],
      status: phone.fields.status[0],
    })
  }) : [];
  return listSuggest ? listSuggest : [];
}

module.exports = {
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
  updateStateUnban,
  getListUnban,
  cancelUnban,
  suggestSearchingES
};
