import { getDbClient } from '../config/db.js';
import { generateExcel } from '../services/reportService.js';
import { sendEmailWithAttachment } from '../services/emailService.js';

export async function runDailyReport() {
  const client = getDbClient();

  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        first_name || ' ' || last_name AS full_name,
        country,
        local_balance,
        calculated_monc
      FROM profile
      WHERE local_balance > 0
    `);

    const filePath = await generateExcel(result.rows);
    await sendEmailWithAttachment(filePath);

  } catch (err) {
    console.error('❌ Report job failed:', err.message);
  } finally {
    await client.end();
  }
}

