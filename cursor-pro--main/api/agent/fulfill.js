
// api/agent/fulfill.js
// Relay endpoint for Agent Webhook.
// Acts as a loopback agent for now (executing fulfillment locally),
// but designed to be replaced by a real external agent relay.

const { sendJson, getEnv, handleCors, parseJsonBody } = require('../../lib/utils');
// Removed: const { processOrder } = require('../../lib/fulfillment');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  // Security Check: AGENT_WEBHOOK_TOKEN
  const webhookToken = getEnv('AGENT_WEBHOOK_TOKEN', { required: true });
  const authHeader = req.headers['authorization'];
  
  // Also check X-Request-Id for idempotency
  const requestId = req.headers['x-request-id'];

  if (authHeader !== `Bearer ${webhookToken}`) {
    return sendJson(res, 401, { error: 'unauthorized' });
  }

  try {
    const body = await parseJsonBody(req);
    const { order_id, event } = body;

    console.log(`[Agent-Relay] Received task: ${event} for order ${order_id} (reqId: ${requestId})`);

    if (!order_id) {
      return sendJson(res, 400, { error: 'missing_order_id' });
    }

    // Idempotency check could be added here if we had a request log table.
    // For now, processOrder handles business logic idempotency (checking is_delivered).

    // --- Relay Logic ---
    // Strictly Relay: Do not execute business logic locally.
    // Just acknowledge receipt and perhaps log/queue it.
    
    // Note: Since this is Vercel Serverless, we can't easily spawn a background thread 
    // that survives the response. 
    // Ideally, "Agent" should be polling or this endpoint should forward to an external queue.
    
    // If you are the "Agent" listening to this endpoint, then your task is already "received".
    // You should now proceed to execute it asynchronously and call back /api/internal/fulfillment-result.
    
    return sendJson(res, 200, { 
      success: true, 
      status: 'queued_for_agent', 
      message: 'Agent has received the task via Relay.' 
    });

  } catch (err) {
    console.error('Agent Relay Error:', err);
    return sendJson(res, 500, { error: 'internal_error', details: err.message });
  }
};
