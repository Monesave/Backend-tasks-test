import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateExcel(customers) {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Customer Report');
      
        sheet.columns = [
          { header: 'Full Name', key: 'full_name', width: 30 },
          { header: 'Country', key: 'country', width: 20 },
          { header: 'Outstanding Balance', key: 'local_balance', width: 20 },
          { header: 'Calculated Monc', key: 'calculated_monc', width: 20 },
        ];
      
        customers.forEach(row => sheet.addRow(row));
      
        const filePath = path.join(__dirname, `../../daily_customer_report-${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    } catch (error) {
        console.error('Error generating Excel file:', error);
        throw error;
    }
}

export async function generateMultiSheetExcel(moncData, ringData) {
    try {
        const workbook = new ExcelJS.Workbook();
      
        const createSheet = (sheetName, data) => {
            const sheet = workbook.addWorksheet(sheetName);
            if (data.length > 0) {
                sheet.columns = Object.keys(data[0]).map(key => ({
                    header: key.replace(/_/g, ' ').toUpperCase(),
                    key,
                }));
                data.forEach(row => sheet.addRow(row));
            }
        };
      
        createSheet('Monc Transactions', moncData);
        createSheet('Ring Transactions', ringData);
      
        const fileName = `transactions-report-${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, '../../reports', fileName);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        await workbook.xlsx.writeFile(filePath);
      
        return filePath;
    } catch (error) {
        console.error('Error generating multi-sheet Excel file:', error);
        throw error;
    }
}