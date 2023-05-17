const { PhoneNumbersSchema } = require('../entities/phone-numbers.entity');
const { getFiveMonth, getSixMonth } = require('../utils/list-month');

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
        }, {
            '$sort': {
                'date': -1,
                'month': 1
            }
        }, {
            '$skip': page * limit
        }, {
            '$limit': limit
        },
    ]);
    return reportsByMonth;
}

async function getListSpammerAgg() {
    const spammerList = await PhoneNumbersSchema.aggregate([
        {
            '$bucket': {
                'groupBy': '$status',
                'boundaries': [
                    'scammer', 'unknown'
                ],
                'default': 'Other',
                'output': {
                    'phoneInfo': {
                        '$push': {
                            'phoneNumber': '$phoneNumber',
                            'isInContact': false,
                            'isSpammer': true
                        }
                    }
                }
            }
        }, {
            '$match': {
                '_id': 'scammer'
            }
        }
    ])
    return spammerList[0];
}

async function getTop10SpammerReports() {
    const top10Spammer = await PhoneNumbersSchema.aggregate([
        {
            '$bucket': {
                'groupBy': '$status',
                'boundaries': [
                    'spammer', 'unknown'
                ],
                'default': 'unknown',
                'output': {
                    'phoneInfo': {
                        '$push': {
                            'reportSize': {
                                '$size': '$reportList'
                            },
                            'phoneNumber': '$phoneNumber',
                            '_id':'$_id',
                        }
                    }
                }
            }
        }, {
            '$match': {
                '_id': 'spammer'
            }
        }, {
            '$unwind': {
                'path': '$phoneInfo'
            }
        }, {
            '$sort': {
                'phoneInfo.reportSize': -1
            }
        }, {
            '$limit': 10
        }, {
            '$project': {
                'reportSize':'$phoneInfo.reportSize',
                'phoneNumber': '$phoneInfo.phoneNumber',
                '_id':'$phoneInfo._id'
            }
        }
    ]
    );
    return top10Spammer;
}

async function getTotalNumbersCreateIn6Month(month, year) {
    const sevenMonth = getSixMonth(month, year);
    const totalNumbers = await PhoneNumbersSchema.aggregate(
        [
            {
                '$project': {
                    'phoneNumber': '$phoneNumber',
                    'month': {
                        '$month': '$createdAt'
                    },
                    'year': {
                        '$year': '$createdAt'
                    }
                }
            },
            {
                '$match': {
                    'year': {
                        '$in': sevenMonth.listYear
                    },
                    'month': {
                        '$in': sevenMonth.listMonth
                    }
                }
            }, {
                '$group': {
                    '_id': {
                        'month': '$month',
                        'year': '$year'
                    },
                    'count': {
                        '$count': {}
                    }
                }
            }, {
                '$sort': {
                    '_id.year': -1,
                    '_id.month': -1
                }
            }
        ]
    );
    console.log(totalNumbers);
    return totalNumbers;
}
module.exports = {
    getQuanityReportInFiveMonth,
    getReportsByMonth,
    getListReportsByPhoneNumber,
    getListSpammerAgg,
    getTop10SpammerReports,
    getTotalNumbersCreateIn6Month
};