// ============================================
// JESUS YOUTH REGISTRATION — GOOGLE APPS SCRIPT BACKEND
// ============================================
// Sheet Tab Name: "Sheet1" (or change below)
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);

    const joinArr = (arr) => (Array.isArray(arr) ? arr.join(', ') : arr || '');

    // 30 Column Mapping (Col A to AD)
    sheet.appendRow([
      new Date(),                                    // A: Timestamp
      data.fullName || '',                           // B: Full Name
      data.dob || '',                                // C: Date of Birth
      data.gender || '',                             // D: Gender
      data.phone || '',                              // E: Primary Phone
      data.whatsapp || data.phone || '',             // F: WhatsApp Number
      data.email || '',                              // G: Email Address
      data.institution || '',                        // H: School / College
      data.course || '',                             // I: Course / Grade
      data.year || '',                               // J: Year of Study
      data.city || '',                               // K: City / Town
      data.district || '',                           // L: Kerala District
      data.parish || '',                             // M: Parish Name
      data.diocese || '',                            // N: Diocese
      data.baptized || '',                           // O: Baptized Status
      data.jyDuration || '',                         // P: Years in JY
      joinArr(data.interests),                       // Q: Areas of Interest
      data.referredBy || '',                         // R: Referred By
      data.skills || '',                             // S: Talents / Skills
      data.instruments || '',                        // T: Instruments Played
      data.meetingTime || '',                        // U: Preferred Meeting Time
      joinArr(data.availableDays),                   // V: Available Days
      data.leadership || '',                         // W: Leadership Interest
      data.emergencyName || '',                      // X: Emergency Contact Name
      data.emergencyPhone || '',                     // Y: Emergency Contact Phone
      data.emergencyRelation || '',                  // Z: Emergency Contact Relation
      data.medicalNotes || '',                       // AA: Medical Notes
      data.dataConsent ? 'Yes' : 'No',               // AB: Data Consent
      data.photoConsent ? 'Yes' : 'No',              // AC: Photo / Media Consent
      data.submittedAt || new Date().toISOString()   // AD: Submitted At ISO
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional GET endpoint to check endpoint liveness
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'online', service: 'Jesus Youth Registration Backend' }))
    .setMimeType(ContentService.MimeType.JSON);
}
