// file: api/support.js
const { sendJson, parseJsonBody, handleCors } = require('../lib/utils');
const { getOrderByOrderId, getSupportMessagesByOrderId, insertSupportMessage } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const orderId = urlObj.searchParams.get('order_id');
    const email = urlObj.searchParams.get('email');

    if (!orderId || !email) {
      return sendJson(res, 400, { error: 'missing_params', message: 'Both order_id and email are required' });
    }

    try {
      const order = await getOrderByOrderId(orderId);
      if (!order || String(order.email || '').toLowerCase() !== String(email || '').toLowerCase()) {
        return sendJson(res, 200, { ok: true, messages: [] });
      }

      const messages = await getSupportMessagesByOrderId(orderId);
      return sendJson(res, 200, { ok: true, order_id: orderId, messages });
    } catch (err) {
      console.error('Error in GET /api/support:', err);
      return sendJson(res, 500, { error: 'internal_error', message: 'Unexpected error' });
    }
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed', message: 'Only GET and POST are allowed' });
  }

  try {
    const { order_id, email, message } = await parseJsonBody(req);

    if (!order_id || !email || !message) {
      return sendJson(res, 400, {
        error: 'missing_fields',
        message: 'order_id, email and message are required',
      });
    }

    const order = await getOrderByOrderId(order_id);
    if (!order || String(order.email || '').toLowerCase() !== String(email || '').toLowerCase()) {
      return sendJson(res, 404, { error: 'order_not_found' });
    }

    const created = await insertSupportMessage({
      order_id,
      email,
      sender: 'customer',
      message,
    });

    return sendJson(res, 200, { ok: true, message: created });
  } catch (err) {
    console.error('Error in /api/support:', err);
    return sendJson(res, 500, {
      error: 'internal_error',
      message: 'Unexpected error',
    });
  }
};
