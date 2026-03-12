const { sendJson, getEnv, handleCors, parseJsonBody } = require('../../lib/utils');
const { updateOrderByOrderId } = require('../../lib/supabase');
const { notifyFulfilled } = require('../../lib/feishu');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const { order_id, license_key, delivery_message, admin_secret } = body;
    const validSecret = process.env.ADMIN_SECRET || '';
    
    // Check header first (Recommended)
    const authHeader = req.headers['x-admin-secret'] || req.headers['authorization'];

    // 若未配置 ADMIN_SECRET，则允许匿名调用（按你的要求）
    if (validSecret) {
      let isAuthenticated = false;
      if (authHeader === validSecret || authHeader === `Bearer ${validSecret}`) {
        isAuthenticated = true;
      } else if (admin_secret === validSecret) {
        isAuthenticated = true;
      }

      if (!isAuthenticated) {
        return sendJson(res, 401, { error: 'unauthorized' });
      }
    }

    if (!order_id || (!license_key && !delivery_message)) {
      return sendJson(res, 400, { error: 'missing_fields', message: 'order_id and either license_key or delivery_message are required' });
    }

    const order = await updateOrderByOrderId(order_id, {
      license_key: license_key || null,
      delivery_message: delivery_message || null,
      is_delivered: true,
      delivery_status: 'delivered',
      np_status: 'finished',
      c2p_status: 'paid',
      updated_at: new Date().toISOString()
    });

    if (!order) {
      return sendJson(res, 404, { error: 'order_not_found' });
    }

    // 飞书通知
    await notifyFulfilled(order_id, delivery_message || license_key || 'delivered', order.email, order.plan);

    return sendJson(res, 200, { success: true, order });
  } catch (err) {
    console.error('Fulfill error:', err);
    return sendJson(res, 500, { error: 'internal_error' });
  }
};
