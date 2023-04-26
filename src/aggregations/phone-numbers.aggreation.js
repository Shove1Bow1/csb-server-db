const { PhoneNumbersSchema } = require('../entities/phone-numbers.entity');
const { getFiveMonth } = require('../utils/five-month');

async function getQuanityReportInFiveMonth() {
    const fiveMonth = getFiveMonth();
    const quanityReportFiveMonth = Promise.all(fiveMonth.map(async (item) => {
        const data = await PhoneNumbersSchema.aggregate([
            {
                '$unwind': '$reportList'
            }, {
                '$project': {
                    'month': {
                        '$month': '$reportList.reportDate'
                    },
                    'year': {
                        '$year': '$reportList.reportDate'
                    }
                }
            }, {
                '$match': {
                    'month': item.month,
                    'year': item.year,
                }
            }, {
                '$count': 'number'
            }
        ])
        const reportQuannity = await data[0];
        return {
            month: item.month,
            year: item.year,
            total: reportQuannity ? reportQuannity.number : 0,
        }
    }));
    return quanityReportFiveMonth;
}

async function getReportsByMonth(month, year, page, limit) {
    const reportsByMonth = await PhoneNumbersSchema.aggregate([
        {
            '$unwind': '$reportList'
        }, {
            '$project': {
                'month': {
                    '$month': '$reportList.reportDate'
                },
                'year': {
                    '$year': '$reportList.reportDate'
                },
                'date': {
                    '$dayOfMonth': '$reportList.reportDate'
                },
                'content': '$reportList.content',
                'title': '$reportList.title'
            }
        }, {
            '$match': {
                'month': month,
                'year': year
            }
        }, {
            '$sort': {
                'date': -1
            }
        }, {
            '$skip': page * limit
        }, {
            '$limit': limit
        }
    ])
    return reportsByMonth;
}
async function getListReportsByPhoneNumber(mobileCodeId, phoneNumber, page, limit) {
    const reportsByMonth = await PhoneNumbersSchema.aggregate([
        {
            '$match': {
                'phoneNumber': String(phoneNumber),
                'mobileCodeId': mobileCodeId
            }
        },
        {
            '$unwind': '$reportList'
        }, {
            '$project': {
                'month': {
                    '$month': '$reportList.reportDate'
                },
                'year': {
                    '$year': '$reportList.reportDate'
                },
                'date': {
                    '$dayOfMonth': '$reportList.reportDate'
                },
                'content': '$reportList.content',
                'title': '$reportList.title',
            }
        },{
            '$sort': {
                'date': -1,
                'month':1
            }
        } , {
            '$skip': page*limit
        }, {
            '$limit': limit
        }, 
    ]);
    return reportsByMonth;
}

module.exports = {
    getQuanityReportInFiveMonth,
    getReportsByMonth,
    getListReportsByPhoneNumber
};