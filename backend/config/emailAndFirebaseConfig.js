import dns from 'dns';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Force Node.js to use IPv4 DNS lookup first to fix Render IPv6 issues
dns.setDefaultResultOrder('ipv4first');

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

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (toEmail, otp, purpose = 'Verification') => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: `Your OTP Code for ${purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">OTP Verification</h2>
          <p style="font-size: 15px; color: #334155;">Hello,</p>
          <p style="font-size: 15px; color: #334155;">Your verification code is: <strong style="font-size: 22px; color: #8b5cf6;">${otp}</strong></p>
          <p style="font-size: 14px; color: #64748b;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `
    });
    console.log('Email sent successfully via Resend API:', data);
    return data;
  } catch (error) {
    console.error('Resend Email Error:', error);
    throw error;
  }
};

export { firebaseAdminApp };

