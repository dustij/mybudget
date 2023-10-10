export function formatDate(d) {
    // d is a Date object
    const month = (d.getMonth() + 1).toString().padStart(2, "0")
    const day = d.getDate().toString().padStart(2, "0")
    const year = d.getFullYear()
    return `${year}-${month}-${day}`
}

export function getNext365Days() {
    const dates = []

    let thisDate = new Date()
    thisDate.setHours(12, 0, 0, 0)

    for (let i = 0; i <= 366; i++) {
        dates.push(new Date(thisDate))
        thisDate.setDate(thisDate.getDate() + 1)
    }

    return dates
}

export function getNext30Days() {
    const dates = []

    let thisDate = new Date()
    thisDate.setHours(12, 0, 0, 0)

    for (let i = 0; i <= 31; i++) {
        dates.push(new Date(thisDate))
        thisDate.setDate(thisDate.getDate() + 1)
    }

    return dates
}

export function getNext60Days() {
    const dates = []

    let thisDate = new Date()
    thisDate.setHours(12, 0, 0, 0)

    for (let i = 0; i <= 61; i++) {
        dates.push(new Date(thisDate))
        thisDate.setDate(thisDate.getDate() + 1)
    }

    return dates
}

export function getNext90Days() {
    const dates = []

    let thisDate = new Date()
    thisDate.setHours(12, 0, 0, 0)

    for (let i = 0; i <= 91; i++) {
        dates.push(new Date(thisDate))
        thisDate.setDate(thisDate.getDate() + 1)
    }

    return dates
}

export function getDatesBetween(startDate, endDate) {
    // startDate and endDate are Date strings in the format YYYY-MM-DD
    const dates = []

    const newStartDate = new Date(getTzAdjustedDate(startDate))
    const newEndDate = new Date(getTzAdjustedDate(endDate)) 

    newStartDate.setHours(12, 0, 0, 0)
    newEndDate.setHours(12, 0, 0, 0)

    let currentDate = newStartDate
    while (currentDate <= newEndDate) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
}

export function getTzAdjustedDate(dateString) {
    const offsetMilliseconds = new Date().getTimezoneOffset() * 60 * 1000
    const tzDate = new Date(`${dateString}T12:00:00.000Z`)
    tzDate.setTime(tzDate.getTime() + offsetMilliseconds)
    return tzDate
}

export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

export function isValidDate(dateString) {
    const timestamp = Date.parse(dateString)
    return !isNaN(timestamp)
  }

export function getWeekday(dateString) {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const date = new Date(dateString)
    date.setHours(12, 0, 0, 0)
    const weekday = date.getDay()
    return weekdays[weekday]
}