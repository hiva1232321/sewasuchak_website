const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} type - 'SIGNUP' or 'REPORT'
 */
async function sendOtpEmail(to, otp, type = 'SIGNUP') {
    const subject = type === 'SIGNUP'
        ? '🔐 Verify Your SewaSuchak Account'
        : '📋 Verify Your Report Submission';

    const heading = type === 'SIGNUP'
        ? 'Welcome to SewaSuchak!'
        : 'Report Verification';

    const message = type === 'SIGNUP'
        ? 'Use the code below to verify your email and complete your registration.'
        : 'Use the code below to verify and submit your report.';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#06b6d4,#3b82f6);padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">सेवासूचक</h1>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Empowering Communities</p>
            </div>
            
            <!-- Body -->
            <div style="padding:32px 24px;">
                <h2 style="color:#0f172a;margin:0 0 8px;font-size:20px;">${heading}</h2>
                <p style="color:#64748b;margin:0 0 24px;font-size:14px;line-height:1.6;">${message}</p>
                
                <!-- OTP Box -->
                <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:2px dashed #06b6d4;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                    <p style="color:#64748b;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Verification Code</p>
                    <div style="font-size:36px;font-weight:800;color:#0891b2;letter-spacing:8px;font-family:monospace;">${otp}</div>
                </div>
                
                <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">⏱ This code expires in <strong>10 minutes</strong></p>
                <p style="color:#94a3b8;font-size:12px;margin:0;">If you didn't request this, please ignore this email.</p>
            </div>
            
            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;margin:0;font-size:11px;">© 2026 SewaSuchak - CiviConnect</p>
            </div>
        </div>
    </body>
    </html>`;

    const mailOptions = {
        from: `"SewaSuchak" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
        // Log OTP to console as fallback for development
        console.log(`📧 [FALLBACK] OTP for ${to}: ${otp}`);
        return { success: false, error: error.message };
    }
}

module.exports = { sendOtpEmail };
