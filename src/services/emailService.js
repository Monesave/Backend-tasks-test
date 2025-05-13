import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export async function sendEmailWithAttachment(transactionReportPath, customerReportPath) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Daily Transactions Report',
      text: 'Attached are the daily MONC and Ring transactions report and the daily customer report.',
      attachments: [
        {
          filename: path.basename(transactionReportPath), // Transaction report
          path: transactionReportPath,
        },
        {
          filename: path.basename(customerReportPath), // Customer report
          path: customerReportPath,
        },
      ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to', process.env.EMAIL_TO);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error for further handling if needed
    }
}