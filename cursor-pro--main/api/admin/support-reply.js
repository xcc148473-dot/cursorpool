const { sendJson, getEnv, handleCors, parseJsonBody } = require('../../lib/utils');
const { getOrderByOrderId, insertSupportMessage } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const { order_id, message, admin_secret } = body;
    const validSecret = process.env.ADMIN_SECRET || '';
    const authHeader = req.headers['x-admin-secret'] || req.headers['authorization'];

    if (validSecret) {
      const isAuthenticated = authHeader === validSecret || authHeader === `Bearer ${validSecret}` || admin_secret === validSecret;
      if (!isAuthenticated) {
        return sendJson(res, 401, { error: 'unauthorized' });
      }
    }

    if (!order_id || !message) {
      return sendJson(res, 400, { error: 'missing_fields', message: 'order_id and message are required' });
    }

    const order = await getOrderByOrderId(order_id);
    if (!order) {
      return sendJson(res, 404, { error: 'order_not_found' });
    }

    const created = await insertSupportMessage({
      order_id,
      email: order.email,
      sender: 'admin',
      message,
    });

    return sendJson(res, 200, { ok: true, message: created });
  } catch (err) {
    console.error('Error in /api/admin/support-reply:', err);
    return sendJson(res, 500, { error: 'internal_error' });
  }
};
