// file: api/health.js
const { sendJson, handleCors } = require('../lib/utils');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'method_not_allowed', message: 'Only GET is allowed' });
  }

  const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_SECRET',
  ];

  const missing = [];
  for (const name of requiredEnv) {
    const v = process.env[name];
    if (!v) missing.push(name);
  }

  if (!process.env.PAYGATE_MERCHANT_WALLET && !process.env.CHAIN2PAY_MERCHANT_WALLET) {
    missing.push('PAYGATE_MERCHANT_WALLET');
  }

  if (!process.env.PAYGATE_CALLBACK_URL && !process.env.CHAIN2PAY_CALLBACK_URL) {
    missing.push('PAYGATE_CALLBACK_URL');
  }

  if (!process.env.FRONTEND_SITE_URL && !process.env.SITE_URL) {
    missing.push('FRONTEND_SITE_URL');
  }

  return sendJson(res, 200, {
    ok: true,
    missingEnv: missing,
  });
};





