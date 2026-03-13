const { sendJson, handleCors } = require('../../lib/utils');
const { listRecentOrders } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  try {
    const validSecret = process.env.ADMIN_SECRET || '';
    const authHeader = req.headers['x-admin-secret'] || req.headers['authorization'];

    if (validSecret) {
      const isAuthenticated = authHeader === validSecret || authHeader === `Bearer ${validSecret}`;
      if (!isAuthenticated) {
        return sendJson(res, 401, { error: 'unauthorized' });
      }
    }

    const orders = await listRecentOrders(100);
    return sendJson(res, 200, { ok: true, orders });
  } catch (err) {
    console.error('Error in /api/admin/orders:', err);
    return sendJson(res, 500, { error: 'internal_error' });
  }
};
