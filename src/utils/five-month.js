function getFiveMonth() {
    const curDate = new Date();
    const curMonth = curDate.getMonth() + 1;
    const curYear = curDate.getFullYear();
    const listMonth = [{
        month: curMonth,
        year: curYear,
    }]
    for (let i = 0; i < 4; i++) {
        listMonth.push(calculateMonthYear(listMonth[i].month, listMonth[i].year))
    }
    return listMonth;
}
function calculateMonthYear(month, year) {
    let lastMonth = month - 1;
    let lastYear;
    if (lastMonth <= 0){
        lastYear = year - 1;
        lastMonth = 12;
    }
    lastMonth = Math.abs(lastMonth);
    return {
        month: lastMonth,
        year: lastYear? lastYear: year,
    };
}
module.exports={
    getFiveMonth
};