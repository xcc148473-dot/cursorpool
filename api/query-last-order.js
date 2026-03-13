const { sendJson, handleCors } = require('../lib/utils');
const { getLastCompletedOrder } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const email = urlObj.searchParams.get('email');

  if (!email) {
    return sendJson(res, 400, { error: 'missing_email' });
  }

  try {
    const order = await getLastCompletedOrder(email);
    if (order && order.license_key) {
      return sendJson(res, 200, { ok: true, key: order.license_key });
    } else {
      return sendJson(res, 404, { ok: false, error: 'No completed order found' });
    }
  } catch (err) {
    console.error('Query error:', err);
    return sendJson(res, 500, { error: 'internal_error' });
  }
};
