const { PhoneNumbersSchema } = require('../entities/phone-numbers.entity');
const { getFiveMonth } = require('../utils/five-month');
async function getQuanityReportInFiveMonth() {
    const fiveMonth = getFiveMonth();
    const quanityReportFiveMonth =await Promise.all(fiveMonth.map(async (item) => {
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
        const reportQuannity=await data[0];
        return {
            month: item.month,
            year: item.year,
            total:reportQuannity?reportQuannity.number : 0,
        }
    }))
    console.log(quanityReportFiveMonth);
    return quanityReportFiveMonth;
}

module.exports = {
    getQuanityReportInFiveMonth,
}