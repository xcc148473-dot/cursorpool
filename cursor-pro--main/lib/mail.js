
// lib/mail.js
const nodemailer = require('nodemailer');
const { getEnv } = require('./utils');

/**
 * Send email using SMTP
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 * @returns {Promise<boolean>}
 */
async function sendEmail(to, subject, text, html) {
  try {
    const host = getEnv('SMTP_HOST', { required: true });
    const port = getEnv('SMTP_PORT', { required: true });
    const user = getEnv('SMTP_USER', { required: true });
    const pass = getEnv('SMTP_PASS', { required: true });
    const from = getEnv('SMTP_FROM', { required: true });

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${from}" <${user}>`, // sender address
      to,
      subject,
      text,
      html,
    });

    console.log(`[Mail] Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Mail] Error sending email:', error);
    return false;
  }
}

module.exports = { sendEmail };
