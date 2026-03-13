// file: lib/email.js
const { getEnv } = require('./utils');

async function sendLicenseEmail({ to, licenseKey, expiresAt }) {
  const apiKey = getEnv('RESEND_API_KEY', { required: true });
  const from = getEnv('MAIL_FROM', { required: true });

  const subject = 'Your license key';
  const text = `Thank you for purchase! Here is your key: ${licenseKey} (Valid until: ${expiresAt})`;

  const body = {
    from,
    to: [to],
    subject,
    text,
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const textBody = await res.text();
  if (!res.ok) {
    let data;
    try {
      data = textBody ? JSON.parse(textBody) : null;
    } catch (e) {
      data = null;
    }
    const err = new Error('Resend email send failed');
    err.status = res.status;
    err.body = data || textBody;
    throw err;
  }
}

module.exports = {
  sendLicenseEmail,
};





