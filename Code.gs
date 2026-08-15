/**
 * BACKEND EN GOOGLE APPS SCRIPT (Code.gs) v6.2.0
 * SINCRONIZACIÓN MULTIDISPOSITIVO REAL (PC + MÓVIL) DE AYUNOS, PESO, EJERCICIO, FÁRMACOS Y BMR (1400 kcal)
 */

const SPREADSHEET_ID = "1RBWEGoqAwswrf5c_QaZqypEmcqtBTMb6-ZrfGZgkOlE";

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getData') {
    const data = getInitialAppData();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Ayuno Intermitente 16:8 - v6.2.0')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;

    let res = { success: false, error: 'Acción no reconocida' };
    if (action === 'saveWeight') {
      res = saveWeightLog(contents.data);
    } else if (action === 'saveFast') {
      res = saveFastingLog(contents.data);
    } else if (action === 'saveExercise') {
      res = saveExerciseLog(contents.data);
    } else if (action === 'deleteExercise') {
      res = deleteExerciseLog(contents.id);
    } else if (action === 'savePause') {
      res = savePauseLog(contents.data);
    } else if (action === 'saveBadge') {
      res = saveUnlockedBadge(contents.data);
    } else if (action === 'saveUserMeds') {
      res = saveUserMeds(contents.data);
    } else if (action === 'saveUserBmr') {
      res = saveUserBmr(contents.data);
    } else if (action === 'saveRoutineConfig') {
      res = saveRoutineConfig(contents.data);
    } else if (action === 'getInitialData') {
      res = getInitialAppData();
    } else if (action === 'setSheetId') {
      res = setCustomSpreadsheetId(contents.spreadsheetId);
    }

    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  let str = String(val).replace(',', '.').trim();
  let num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function getSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    setupSheets(ss);
    return ss;
  } catch (e) {
    throw new Error('Error accediendo a Google Sheet: ' + e.message);
  }
}

function setupSheets(ss) {
  try {
    let sheetAyunos = ss.getSheetByName('Registro_Ayunos');
    if (!sheetAyunos) {
      sheetAyunos = ss.insertSheet('Registro_Ayunos');
      sheetAyunos.appendRow(['ID', 'Fecha_Inicio', 'Fecha_Fin', 'Horas_Ayuno', 'Meta_16h_Cumplida']);
      sheetAyunos.getRange("A1:E1").setFontWeight("bold").setBackground("#00b4d8").setFontColor("#ffffff");
    }

    let sheetPeso = ss.getSheetByName('Registro_Peso');
    if (!sheetPeso) {
      sheetPeso = ss.insertSheet('Registro_Peso');
      sheetPeso.appendRow(['ID', 'Fecha', 'Peso_Kg', 'Diferencia_a_Meta_82kg']);
      sheetPeso.getRange("A1:D1").setFontWeight("bold").setBackground("#00f5d4").setFontColor("#000000");
    }

    let sheetLogros = ss.getSheetByName('Logros');
    if (!sheetLogros) {
      sheetLogros = ss.insertSheet('Logros');
      sheetLogros.appendRow(['ID_Logro', 'Fecha_Desbloqueo']);
      sheetLogros.getRange("A1:B1").setFontWeight("bold").setBackground("#7209b7").setFontColor("#ffffff");
    }

    let sheetEjercicio = ss.getSheetByName('Registro_Ejercicio');
    if (!sheetEjercicio) {
      sheetEjercicio = ss.insertSheet('Registro_Ejercicio');
      sheetEjercicio.appendRow(['ID', 'Fecha', 'Tipo_Ejercicio', 'Duracion_Min', 'Pasos', 'Calorias_Est', 'Notas']);
      sheetEjercicio.getRange("A1:G1").setFontWeight("bold").setBackground("#ff5400").setFontColor("#ffffff");
    }

    let sheetPausas = ss.getSheetByName('Registro_Pausas');
    if (!sheetPausas) {
      sheetPausas = ss.insertSheet('Registro_Pausas');
      sheetPausas.appendRow(['ID', 'Fecha', 'Motivo', 'Notas']);
      sheetPausas.getRange("A1:D1").setFontWeight("bold").setBackground("#ffb703").setFontColor("#000000");
    }

    const defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (defaultSheet && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch(err) {}
    }
  } catch(e) {}
}

function getInitialAppData() {
  try {
    const ss = getSpreadsheet();
    const scriptProperties = PropertiesService.getScriptProperties();
    const activeFast = scriptProperties.getProperty('ACTIVE_FAST_DATA');
    const userMeds = scriptProperties.getProperty('USER_MEDS_DATA');
    const bmrVal = scriptProperties.getProperty('USER_BMR_DATA');
    const routineCfg = scriptProperties.getProperty('ROUTINE_CONFIG_DATA');

    // Desduplicar hoja de peso automáticamente si existen duplicados del mismo día
    deduplicateWeightSheet(ss);

    return {
      success: true,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl(),
      activeFast: activeFast ? JSON.parse(activeFast) : null,
      fastingLogs: getFastingLogsInternal(ss),
      weightLogs: getWeightLogsInternal(ss),
      exerciseLogs: getExerciseLogsInternal(ss),
      pauseLogs: getPauseLogsInternal(ss),
      unlockedBadges: getUnlockedBadgesInternal(ss),
      userMeds: userMeds ? JSON.parse(userMeds) : [],
      bmr: bmrVal ? parseNumber(bmrVal) : 1400,
      routineConfig: routineCfg ? JSON.parse(routineCfg) : null
    };
  } catch (e) {
    return {
      success: false,
      error: e.message || String(e)
    };
  }
}

function saveUserMeds(medsList) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('USER_MEDS_DATA', JSON.stringify(medsList || []));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function saveUserBmr(bmrVal) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('USER_BMR_DATA', String(bmrVal || 1400));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function saveRoutineConfig(config) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('ROUTINE_CONFIG_DATA', JSON.stringify(config));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

/**
 * REGLA: MÁXIMO 1 PESO POR DÍA.
 * Si se ingresa un nuevo peso el mismo día, actualiza el registro existente.
 */
function saveWeightLog(weightEntry) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Registro_Peso');
    const weightNum = parseNumber(weightEntry.weight);
    if (weightNum === null) return { success: false, error: 'Peso inválido' };

    const diffToMeta = Number((weightNum - 82.0).toFixed(1));
    const tz = Session.getScriptTimeZone() || "GMT";
    const entryDate = new Date(weightEntry.date || Date.now());
    const dateDayStr = Utilities.formatDate(entryDate, tz, "yyyy-MM-dd");
    const fullDateFormatted = Utilities.formatDate(entryDate, tz, "yyyy-MM-dd HH:mm:ss");

    const data = sheet.getDataRange().getValues();
    let updatedRow = false;

    // Buscar si ya existe un registro para el mismo día (yyyy-MM-dd)
    for (let i = 1; i < data.length; i++) {
      let cellDate = data[i][1];
      let rowDayStr = "";
      if (cellDate instanceof Date) {
        rowDayStr = Utilities.formatDate(cellDate, tz, "yyyy-MM-dd");
      } else if (cellDate) {
        rowDayStr = String(cellDate).substring(0, 10);
      }

      if (rowDayStr === dateDayStr) {
        const rowIndex = i + 1; // 1-indexed en Apps Script
        sheet.getRange(rowIndex, 1).setValue(String(weightEntry.id));
        sheet.getRange(rowIndex, 2).setValue(fullDateFormatted);
        sheet.getRange(rowIndex, 3).setValue(weightNum);
        sheet.getRange(rowIndex, 4).setValue(diffToMeta);
        updatedRow = true;
        break;
      }
    }

    if (!updatedRow) {
      sheet.appendRow([
        String(weightEntry.id),
        fullDateFormatted,
        weightNum,
        diffToMeta
      ]);
    }

    deduplicateWeightSheet(ss);
    return { success: true, updated: updatedRow, weightLogs: getWeightLogsInternal(ss) };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

/**
 * Limpia y desduplica la hoja Registro_Peso dejando SOLO un peso por día
 */
function deduplicateWeightSheet(ss) {
  try {
    const sheet = ss.getSheetByName('Registro_Peso');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 2) return;

    const tz = Session.getScriptTimeZone() || "GMT";
    const uniqueByDay = new Map();

    for (let i = 1; i < data.length; i++) {
      const wVal = parseNumber(data[i][2]);
      if (data[i][0] && wVal !== null) {
        let cellDate = data[i][1];
        let dayStr = "";
        let fullDate = cellDate;
        if (cellDate instanceof Date) {
          dayStr = Utilities.formatDate(cellDate, tz, "yyyy-MM-dd");
          fullDate = Utilities.formatDate(cellDate, tz, "yyyy-MM-dd HH:mm:ss");
        } else {
          dayStr = String(cellDate).substring(0, 10);
        }

        uniqueByDay.set(dayStr, {
          id: String(data[i][0]),
          date: fullDate,
          weight: wVal,
          diff: Number((wVal - 82.0).toFixed(1))
        });
      }
    }

    if (uniqueByDay.size < data.length - 1) {
      sheet.clearContents();
      sheet.appendRow(['ID', 'Fecha', 'Peso_Kg', 'Diferencia_a_Meta_82kg']);
      sheet.getRange("A1:D1").setFontWeight("bold").setBackground("#00f5d4").setFontColor("#000000");

      uniqueByDay.forEach(entry => {
        sheet.appendRow([entry.id, entry.date, entry.weight, entry.diff]);
      });
    }
  } catch (e) {
    Logger.log('Error deduplicating weights: ' + e.message);
  }
}

function saveFastingLog(logEntry) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Registro_Ayunos');
    const tz = Session.getScriptTimeZone() || "GMT";

    let startFormatted = logEntry.startTime;
    let endFormatted = logEntry.endTime;
    try {
      startFormatted = Utilities.formatDate(new Date(logEntry.startTime), tz, "yyyy-MM-dd HH:mm:ss");
      endFormatted = Utilities.formatDate(new Date(logEntry.endTime), tz, "yyyy-MM-dd HH:mm:ss");
    } catch(e) {}

    sheet.appendRow([
      String(logEntry.id),
      startFormatted,
      endFormatted,
      parseNumber(logEntry.durationHours),
      logEntry.completedGoal ? 'SÍ' : 'NO'
    ]);

    saveActiveFastState(null);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function saveActiveFastState(fastData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    if (fastData) {
      scriptProperties.setProperty('ACTIVE_FAST_DATA', JSON.stringify(fastData));
    } else {
      scriptProperties.deleteProperty('ACTIVE_FAST_DATA');
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function saveUnlockedBadge(badgeId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Logros');
    sheet.appendRow([String(badgeId), new Date().toISOString()]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function getWeightLogsInternal(ss) {
  try {
    const sheet = ss.getSheetByName('Registro_Peso');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const logs = [];
    const tz = Session.getScriptTimeZone() || "GMT";

    for (let i = 1; i < data.length; i++) {
      const weightParsed = parseNumber(data[i][2]);
      if (data[i][0] && weightParsed !== null) {
        let dateVal = data[i][1];
        let dateStr = dateVal;
        if (dateVal instanceof Date) {
          dateStr = Utilities.formatDate(dateVal, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        } else {
          dateStr = String(dateVal);
        }

        logs.push({
          id: String(data[i][0]),
          date: dateStr,
          weight: weightParsed
        });
      }
    }
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return logs;
  } catch (e) {
    return [];
  }
}

function getFastingLogsInternal(ss) {
  try {
    const sheet = ss.getSheetByName('Registro_Ayunos');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const logs = [];
    const tz = Session.getScriptTimeZone() || "GMT";

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        let startVal = data[i][1];
        let endVal = data[i][2];
        let startStr = startVal instanceof Date ? Utilities.formatDate(startVal, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : String(startVal);
        let endStr = endVal instanceof Date ? Utilities.formatDate(endVal, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : String(endVal);

        logs.push({
          id: String(data[i][0]),
          startTime: startStr,
          endTime: endStr,
          durationHours: parseNumber(data[i][3]),
          completedGoal: String(data[i][4]) === 'SÍ'
        });
      }
    }
    return logs.reverse();
  } catch (e) {
    return [];
  }
}

function getUnlockedBadgesInternal(ss) {
  try {
    const sheet = ss.getSheetByName('Logros');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const badges = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && !badges.includes(String(data[i][0]))) {
        badges.push(String(data[i][0]));
      }
    }
    return badges;
  } catch (e) {
    return [];
  }
}

function saveExerciseLog(exerciseEntry) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Registro_Ejercicio');
    const tz = Session.getScriptTimeZone() || "GMT";
    const entryDate = new Date(exerciseEntry.date || Date.now());
    const fullDateFormatted = Utilities.formatDate(entryDate, tz, "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      String(exerciseEntry.id),
      fullDateFormatted,
      String(exerciseEntry.type || 'Ejercicio'),
      parseNumber(exerciseEntry.durationMinutes) || 0,
      parseNumber(exerciseEntry.steps) || 0,
      parseNumber(exerciseEntry.calories) || 0,
      String(exerciseEntry.notes || '')
    ]);

    return { success: true, exerciseLogs: getExerciseLogsInternal(ss) };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function getExerciseLogsInternal(ss) {
  try {
    const sheet = ss.getSheetByName('Registro_Ejercicio');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const logs = [];
    const tz = Session.getScriptTimeZone() || "GMT";

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        let dateVal = data[i][1];
        let dateStr = dateVal instanceof Date ? Utilities.formatDate(dateVal, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : String(dateVal);

        logs.push({
          id: String(data[i][0]),
          date: dateStr,
          type: String(data[i][2]),
          durationMinutes: parseNumber(data[i][3]) || 0,
          steps: parseNumber(data[i][4]) || 0,
          calories: parseNumber(data[i][5]) || 0,
          notes: String(data[i][6] || '')
        });
      }
    }
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return logs;
  } catch (e) {
    return [];
  }
}

function deleteExerciseLog(exerciseId) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Registro_Ejercicio');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(exerciseId)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return { success: true, exerciseLogs: getExerciseLogsInternal(ss) };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function savePauseLog(pauseEntry) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Registro_Pausas');
    const tz = Session.getScriptTimeZone() || "GMT";
    const entryDate = new Date(pauseEntry.date || Date.now());
    const fullDateFormatted = Utilities.formatDate(entryDate, tz, "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      String(pauseEntry.id),
      fullDateFormatted,
      String(pauseEntry.reason || 'Día de Pausa / Cena Especial'),
      String(pauseEntry.notes || '')
    ]);

    saveActiveFastState(null);
    return { success: true, pauseLogs: getPauseLogsInternal(ss) };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function getPauseLogsInternal(ss) {
  try {
    const sheet = ss.getSheetByName('Registro_Pausas');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const logs = [];
    const tz = Session.getScriptTimeZone() || "GMT";

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        let dateVal = data[i][1];
        let dateStr = dateVal instanceof Date ? Utilities.formatDate(dateVal, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : String(dateVal);

        logs.push({
          id: String(data[i][0]),
          date: dateStr,
          reason: String(data[i][2]),
          notes: String(data[i][3] || '')
        });
      }
    }
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return logs;
  } catch (e) {
    return [];
  }
}
