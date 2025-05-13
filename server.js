import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import quickbooksRoutes from './src/routes/quickbooksRoutes.js';
import { runDailyReport } from './src/jobs/dailyReportJob.js';
import { runDailyTransactionsReport } from './src/jobs/dailyTransactionsReport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true if using HTTPS
  }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
app.use('/api/quickbooks', quickbooksRoutes);

// Test runDailyReport
(async () => {
  try {
    await runDailyReport();
    console.log('✅ runDailyReport executed successfully');
  } catch (err) {
    console.error('❌ Error in runDailyReport:', err);
  }
})();

// Test runDailyTransactionsReport
(async () => {
  try {
    await runDailyTransactionsReport();
    console.log('✅ runDailyTransactionsReport executed successfully');
  } catch (err) {
    console.error('❌ Error in runDailyTransactionsReport:', err);
  }
})();


cron.schedule('0 8 * * *', () => {
    console.log('📆 Running scheduled daily report...');
    runDailyReport();
  });

  cron.schedule('0 8 * * *', () => {
    console.log('Running daily transactions report...');
    runDailyTransactionsReport();
  });  


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});