export function formatDate(d) {
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}


export function getNext365Days() {
    const dates = [];

    let thisDate = new Date()
    thisDate.setHours(12, 0, 0, 0);

    for (let i = 0; i <= 365; i++) {
        dates.push(new Date(thisDate));
        thisDate.setDate(thisDate.getDate() + 1);
    }

    return dates;
};


export function getDatesInRange(fromDate, toDate) {
    const dates = [];

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0);

    let currentDate = startDate;
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    };

    return dates;
};


export function getTzAdjustedDate(date) {
    const offsetMilliseconds = new Date().getTimezoneOffset() * 60 * 1000;
    const tzDate = new Date(`${date}T12:00:00.000Z`);
    tzDate.setTime(tzDate.getTime() + offsetMilliseconds);
    return tzDate;
};


export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};