import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin SDK Initialization
let firebaseAdminApp = null;
try {
  const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccount.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const admin = await import('firebase-admin');
    if (!admin.default.apps.length) {
      if (serviceAccount.private_key && serviceAccount.private_key.length > 200 && !serviceAccount.private_key.includes('MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...')) {
        firebaseAdminApp = admin.default.initializeApp({
          credential: admin.default.credential.cert(serviceAccount)
        });
        console.log('[FIREBASE ADMIN] Admin SDK Initialized Successfully (Project ID:', serviceAccount.project_id, ')');
      } else {
        console.log('[FIREBASE ADMIN] Service Account Config Loaded (Project ID:', serviceAccount.project_id, ')');
      }
    } else {
      firebaseAdminApp = admin.default.app();
    }
  }
} catch (err) {
  // Silent fallback when using placeholder keys
}



// Nodemailer Transporter Setup
const EMAIL_USER = process.env.EMAIL_USER || 'sudiptapaul868@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'kdhhovslzfzdpvcv';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sudiptapaul868@gmail.com',
    pass: process.env.EMAIL_PASS || 'kdhhovslzfzdpvcv'
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});




// Helper function to send 6-digit OTP email
export const sendOTPEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const mailOptions = {
    from: `"Dipto Fashion Auth" <${EMAIL_USER}>`,
    to: toEmail,
    subject: `[${otpCode}] Your OTP Code for ${purpose}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">OTP Verification</h2>
        <p style="font-size: 15px; color: #334155;">Hello,</p>
        <p style="font-size: 15px; color: #334155;">Your 6-digit One-Time Password (OTP) for <strong>${purpose}</strong> is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; color: #64748b;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request this OTP, please ignore this email.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

export { firebaseAdminApp };
