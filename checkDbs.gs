/**
 * Parses DBS date values safely, handling both Date objects and strings.
 */
function parseDBSDate(value) {
  Logger.log("Raw value: " + value + " | Type: " + typeof value);

  if (!value) return null;  // Skip null/undefined/empty

  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    let cleaned = value.trim();
    if (!cleaned) return null;

    let parts = cleaned.split(/[-\/]/);
    if (parts.length !== 3) return null;

    // Handles YYYY-MM-DD or YYYY/MM/DD
    if (parts[0].length === 4) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    // Handles DD-MM-YYYY or DD/MM/YYYY
    if (parts[2].length === 4) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }

  return null;
}

/**
 * Checks DBS certificate issue dates in the active sheet.
 * Expects:
 *   A - First Name
 *   B - Last Name
 *   D - DBS Issue Date
 */
function checkOldDBS() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found.');
    return;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var today = new Date();
  var names = [];

  for (var i = 0; i < data.length; i++) {
    var firstName = data[i][0];
    var lastName = data[i][1];
    var rawDate = data[i][3];
    var issueDate = parseDBSDate(rawDate);

    if (issueDate) {
      var diffDays = (today - issueDate) / (1000 * 60 * 60 * 24);
      if (diffDays >= 365) {
        names.push(firstName + ' ' + lastName);
      }
    } else if (firstName || lastName || rawDate) {
      Logger.log(`Invalid date for ${firstName} ${lastName}: ${rawDate}`);
    }
  }

  var ui = SpreadsheetApp.getUi();
  if (names.length > 0) {
    ui.alert('DBS checks over one year old:\n' + names.join('\n'));
  } else {
    ui.alert('No DBS checks are over one year old.');
  }
}

function onOpen(e) {
  checkOldDBS();
}

/**
 * Debug helper to list all tutors and days since DBS issue.
 */
function debugListDiffDays() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found.');
    return;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var today = new Date();
  var lines = [];

  for (var i = 0; i < data.length; i++) {
    var firstName = data[i][0];
    var lastName = data[i][1];
    var rawDate = data[i][3];
    var issueDate = parseDBSDate(rawDate);

    if (issueDate) {
      var diffDays = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24));
      lines.push(firstName + ' ' + lastName + ': ' + diffDays + ' days');
    } else if (firstName || lastName || rawDate) {
      lines.push(firstName + ' ' + lastName + ': invalid date');
    }
  }

  SpreadsheetApp.getUi().alert(lines.join('\n'));
}
