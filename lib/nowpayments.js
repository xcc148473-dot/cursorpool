// file: lib/nowpayments.js
const { getEnv } = require('./utils');

async function createInvoice(params) {
  const apiKey = getEnv('NOWPAYMENTS_API_KEY', { required: true });

  const body = {
    price_amount: params.priceAmount,
    price_currency: params.priceCurrency || 'usd',
    order_id: params.orderId,
    order_description: `Plan: ${params.plan}, Email: ${params.email}`,
    ipn_callback_url: params.ipnCallbackUrl,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    is_fixed_rate: true,
  };

  const res = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const err = new Error('NOWPayments create invoice failed');
    err.status = res.status;
    err.body = data || text;
    throw err;
  }

  return data;
}

module.exports = {
  createInvoice,
};





