function Firstweekday(day) {
  let firstDayOfWeek = new Date();

  if (day.getDay()===0) {
    firstDayOfWeek = day.setDate(day.getDate() - 6);
  } else {
    firstDayOfWeek = day.setDate(day.getDate() - day.getDay() + 1);
  }

  return firstDayOfWeek;
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  return [year, month, day].join('-');
}

function entireWeek(props) {

  let firstDay = new Date(Firstweekday(props));
  const dates = [];

  for (var k=0; k<=4; k++) {
    let nextDay = new Date(firstDay.setDate(firstDay.getDate() + k));
    let nextDayFormat = formatDate(nextDay);
    firstDay = new Date(Firstweekday(props));
    dates.push(nextDayFormat);
  };

  return dates

}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}

module.exports = {Firstweekday, formatDate, entireWeek, getWeekNumber}
