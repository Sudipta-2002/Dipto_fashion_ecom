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

// Resend API Transport (HTTPS port 443 — bypasses Render SMTP port blocks)
const resendApiKey = process.env.RESEND_API_KEY || 're_123456789';
const resend = new Resend(resendApiKey);

// Nodemailer Transporter Fallback Setup
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  family: 4,     // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000
});



// Helper function to send 6-digit OTP email via Resend API (or Nodemailer fallback)
export const sendOTPEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
      <h2 style="color: #4f46e5; text-align: center; margin-top: 0;">OTP Verification</h2>
      <p style="font-size: 15px; color: #334155;">Hello,</p>
      <p style="font-size: 15px; color: #334155;">Your 6-digit One-Time Password (OTP) for <strong>${purpose}</strong> is:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #8b5cf6; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; display: inline-block;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request this OTP, please ignore this email.</p>
    </div>
  `;

  // 1. Primary: Try Resend HTTPS API (bypasses Render SMTP port blocking)
  try {
    const resendResponse = await resend.emails.send({
      from: 'Dipto Fashion <onboarding@resend.dev>',
      to: [toEmail],
      subject: `[${otpCode}] Your OTP Code for ${purpose}`,
      html: htmlContent
    });
    
    if (resendResponse && (resendResponse.id || resendResponse.data)) {
      console.log('Email sent successfully via Resend API:', resendResponse);
      return resendResponse;
    }
  } catch (resendError) {
    console.warn('Resend API dispatch failed or key unconfigured, falling back to Nodemailer SMTP:', resendError.message);
  }

  // 2. Fallback: Nodemailer SMTP
  const mailOptions = {
    from: `"Dipto Fashion Auth" <${process.env.EMAIL_USER || 'sudiptapaul868@gmail.com'}>`,
    to: toEmail,
    subject: `[${otpCode}] Your OTP Code for ${purpose}`,
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
};



export { firebaseAdminApp };
