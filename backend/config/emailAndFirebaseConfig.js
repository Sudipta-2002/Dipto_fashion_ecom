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
      from: 'Dipto Fashion <noreply@diptofashion.in>',
      to: toEmail,
      subject: 'Your Dipto Fashion Verification Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #701a75; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Dipto Fashion</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">Premium Ethnic &amp; Fashion Collection</p>
          </div>
          <div style="background: #fdf4ff; border-left: 4px solid #c026d3; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="font-size: 15px; color: #334155; margin: 0; line-height: 1.5; font-weight: 600;">
              Welcome to Dipto Fashion! Use the following OTP to verify your email address:
            </p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%); color: #ffffff; padding: 16px 36px; border-radius: 12px; font-size: 34px; font-weight: 800; letter-spacing: 8px; box-shadow: 0 8px 20px rgba(112, 26, 117, 0.25);">
              ${otp}
            </div>
          </div>
          <div style="background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin-bottom: 28px; text-align: center;">
            <p style="font-size: 13px; color: #64748b; margin: 0; font-weight: 500;">
              🔒 This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <div style="text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">If you didn't request this code, please ignore this email.</p>
            <p style="margin: 0; font-weight: 600; color: #cbd5e1;">© Dipto Fashion. All rights reserved.</p>
          </div>
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

