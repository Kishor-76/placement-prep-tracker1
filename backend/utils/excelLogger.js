const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../../placement.xlsx');

async function getOrCreateWorkbook() {
  const workbook = new ExcelJS.Workbook();
  if (fs.existsSync(EXCEL_PATH)) {
    try {
      await workbook.xlsx.readFile(EXCEL_PATH);
    } catch (e) {
      console.warn('[Excel Warning] Could not read existing sheet, recreating...', e);
      initializeNewWorkbook(workbook);
    }
  } else {
    initializeNewWorkbook(workbook);
  }
  return workbook;
}

function initializeNewWorkbook(workbook) {
  const loginSheet = workbook.addWorksheet('Logins');
  loginSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Email Address', key: 'email', width: 30 },
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Daily Target Goal', key: 'targetGoal', width: 18 }
  ];
  loginSheet.getRow(1).font = { bold: true };

  const solveSheet = workbook.addWorksheet('Solves');
  solveSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Email Address', key: 'email', width: 30 },
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Question Title', key: 'title', width: 35 },
    { header: 'Difficulty', key: 'difficulty', width: 12 },
    { header: 'Topic Category', key: 'topic', width: 18 }
  ];
  solveSheet.getRow(1).font = { bold: true };
}

async function logLogin(email, username, targetGoal) {
  try {
    const workbook = await getOrCreateWorkbook();
    const sheet = workbook.getWorksheet('Logins') || workbook.addWorksheet('Logins');
    sheet.addRow({
      timestamp: new Date().toLocaleString(),
      email,
      username,
      targetGoal
    });
    await workbook.xlsx.writeFile(EXCEL_PATH);
    console.log(`[Excel] Logged login event for ${email}`);
  } catch (err) {
    console.error('[Excel Error] Failed to write login event:', err);
  }
}

async function logSolve(email, username, title, difficulty, topic) {
  try {
    const workbook = await getOrCreateWorkbook();
    const sheet = workbook.getWorksheet('Solves') || workbook.addWorksheet('Solves');
    sheet.addRow({
      timestamp: new Date().toLocaleString(),
      email,
      username,
      title,
      difficulty,
      topic
    });
    await workbook.xlsx.writeFile(EXCEL_PATH);
    console.log(`[Excel] Logged solve event for ${email} - ${title}`);
  } catch (err) {
    console.error('[Excel Error] Failed to write solve event:', err);
  }
}

module.exports = {
  logLogin,
  logSolve
};
