
// api/internal/fulfillment/dispatch.js
// Manual or Cron trigger for fulfillment.
// Can be used to retry failed orders.

const { sendJson, getEnv, handleCors, parseJsonBody } = require('../../../lib/utils');
const { processOrder } = require('../../../lib/fulfillment');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  // Security Check: Internal API Key or Admin Secret
  const adminSecret = getEnv('ADMIN_SECRET', { required: true });
  const authHeader = req.headers['authorization'] || req.headers['x-admin-secret'];
  
  if (authHeader !== adminSecret && authHeader !== `Bearer ${adminSecret}`) {
    return sendJson(res, 401, { error: 'unauthorized' });
  }

  try {
    const body = await parseJsonBody(req);
    const { order_id, force } = body;

    if (!order_id) {
      return sendJson(res, 400, { error: 'missing_order_id' });
    }

    const result = await processOrder(order_id, force);
    
    return sendJson(res, 200, result);
  } catch (err) {
    console.error('Dispatch error:', err);
    return sendJson(res, 500, { error: 'internal_error', details: err.message });
  }
};
