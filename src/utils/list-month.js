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
function getSixMonth(month, year){
    const curDate = new Date();
   
    const listMonth=[];
    const listYear=[];
    if(!month){
        month=curDate.getMonth()+1;
    }
    if(!year){
        year=curDate.getFullYear();
    }
    const list=[{
        month,
        year,
    }]
    listMonth.push(month);
    listYear.push(year);
    for (let i = 0; i < 6; i++) {
        const result=calculateMonthYear(list[i].month, list[i].year);
        list.push(result);
        listMonth.push(result.month);
        if(listYear[listYear.length-1]!==result.year){
            listYear.push(result.year);
        }
    }
    return {listMonth, listYear};
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
    getFiveMonth,
    getSixMonth,
};