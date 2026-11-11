/**
 * DMTool Catalog API (Google Apps Script)
 * Deploy as Web App: Execute as Me, Who has access: Anyone
 *
 * Query:
 *   ?resource=spells  -> { version, source, spells: [...] }
 *   ?resource=store   -> { version, source, items: [...] }
 *
 * Sheet headers (row 1) must match field keys:
 *   Spells: l,n,r,c,d,dmg
 *   Store:  n,c,v,t,ct,ty
 */
var SPELLS_SHEET_ID = '10EBcUARS1_t9hnJMpgLpa65zp2vPOcQXbN1HhtAtzuA';
var STORE_SHEET_ID = '1kqkRau0t0vzOsHvTMIJMqcaQ-vmOyH2McoyA_Ek_blA';

function doGet(e) {
  var resource = String((e && e.parameter && e.parameter.resource) || '').toLowerCase();
  try {
    if (resource === 'spells' || resource === 'spell') {
      return json_({
        version: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        source: 'google-sheet-api',
        spells: readSheetObjects_(SPELLS_SHEET_ID, 'Spells')
      });
    }
    if (resource === 'store' || resource === 'items' || resource === 'shop') {
      return json_({
        version: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        source: 'google-sheet-api',
        items: readSheetObjects_(STORE_SHEET_ID, 'Store')
      });
    }
    return json_({
      ok: false,
      error: 'Unknown resource. Use ?resource=spells or ?resource=store',
      examples: [
        '?resource=spells',
        '?resource=store'
      ]
    }, 400);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) }, 500);
  }
}

function readSheetObjects_(spreadsheetId, preferredName) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sh = ss.getSheetByName(preferredName) || ss.getSheets()[0];
  var values = sh.getDataRange().getValues();
  if (!values || values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h || '').trim(); });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (!row || row.every(function (c) { return c === '' || c === null; })) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      var v = row[c];
      if (headers[c] === 'l' || headers[c] === 'v' || headers[c] === 't' || headers[c] === 'ct') {
        var n = Number(v);
        obj[headers[c]] = isNaN(n) ? v : n;
      } else {
        obj[headers[c]] = v == null ? '' : String(v);
      }
    }
    out.push(obj);
  }
  return out;
}

function json_(obj, status) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
