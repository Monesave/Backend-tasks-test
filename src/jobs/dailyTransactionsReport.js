import { getDbClient } from '../config/db.js';
import { generateMultiSheetExcel } from '../services/reportService.js';
import { sendEmailWithAttachment } from '../services/emailService.js';

export async function runDailyTransactionsReport() {
  const client = getDbClient();
  try {
    await client.connect();

    const today = new Date().toISOString().split('T')[0];

    const moncQuery = `
      SELECT first_name, last_name, created_at
      FROM monc_transaction
      WHERE DATE(created_at) = $1
    `;

    const ringQuery = `
      SELECT first_name, last_name, created_at
      FROM ring_transaction
      WHERE DATE(created_at) = $1
    `;

    const moncResult = await client.query(moncQuery, [today]);
    const ringResult = await client.query(ringQuery, [today]);

    const transactionReportPath = await generateMultiSheetExcel(moncResult.rows, ringResult.rows);
    await sendEmailWithAttachment(transactionReportPath);

  } catch (err) {
    console.error('❌ Daily transaction report failed:', err.message);
  } finally {
    await client.end();
  }
}