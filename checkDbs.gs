function checkOldDBS() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var today = new Date();
  var names = [];
  for (var i = 1; i < data.length; i++) {
    var name = data[i][0];
    var issueDate = data[i][1];
    if (issueDate instanceof Date) {
      var diffDays = (today - issueDate) / (1000 * 60 * 60 * 24);
      if (diffDays >= 365) {
        names.push(name);
      }
    }
  }

  if (names.length > 0) {
    SpreadsheetApp.getUi().alert('DBS checks over one year old:\n' + names.join('\n'));
  } else {
    SpreadsheetApp.getUi().alert('No DBS checks are over one year old.');
  }
}
