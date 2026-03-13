
// api/internal/fulfillment-result.js
// Callback endpoint for Agent to report fulfillment status

const { sendJson, getEnv, handleCors, parseJsonBody } = require('../../lib/utils');
const { updateOrderByOrderId } = require('../../lib/supabase');
const { notifyFulfilled } = require('../../lib/feishu');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  // Security Check: Internal Token
  const internalToken = getEnv('INTERNAL_TOKEN', { required: true });
  const authHeader = req.headers['authorization'];
  
  if (authHeader !== `Bearer ${internalToken}`) {
    return sendJson(res, 401, { error: 'unauthorized' });
  }

  try {
    const body = await parseJsonBody(req);
    const { order_id, status, vendor_order_id, card_secret, delivered_via, delivered_to, error_code, error_message, retryable } = body;

    if (!order_id || !status) {
      return sendJson(res, 400, { error: 'missing_fields', message: 'order_id and status are required' });
    }

    console.log(`[Fulfillment-Result] Received callback for ${order_id}: ${status}`);

    // Idempotency Check: Get current order state
    const currentOrder = await require('../../lib/supabase').getOrderByOrderId(order_id);
    
    if (!currentOrder) {
      return sendJson(res, 404, { error: 'order_not_found' });
    }

    if (currentOrder.is_delivered) {
      console.log(`[Fulfillment-Result] Order ${order_id} already delivered. Ignoring duplicate callback.`);
      return sendJson(res, 200, { success: true, message: 'already_delivered', order_id });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (status === 'delivered') {
      if (!card_secret) {
        return sendJson(res, 400, { error: 'missing_secret', message: 'card_secret is required for delivered status' });
      }
      
      updateData.is_delivered = true;
      updateData.license_key = card_secret;
      updateData.delivery_status = 'delivered';
      updateData.fulfilled_at = new Date().toISOString();
      updateData.vendor_order_id = vendor_order_id || null;
      
      updateData.delivery_info = JSON.stringify({
        delivered_via,
        delivered_to,
        // preserved for audit
        vendor_callback_meta: body 
      });
      
    } else if (status === 'failed') {
      updateData.delivery_status = 'failed';
      updateData.last_procurement_error = `${error_code || 'UNKNOWN'}: ${error_message || 'No details'}`;
      // updateData.retryable = retryable; // If you have this column
      
      updateData.delivery_info = JSON.stringify({
        error_code,
        error_message,
        retryable,
        failed_at: new Date().toISOString()
      });
      // Optionally update retry_count logic here if needed
    } else {
      return sendJson(res, 400, { error: 'invalid_status', message: 'status must be delivered or failed' });
    }

    await updateOrderByOrderId(order_id, updateData);
    
    // 如果是发货成功，发送飞书通知
    if (status === 'delivered') {
      await notifyFulfilled(order_id, card_secret, currentOrder.email, currentOrder.plan);
    }

    return sendJson(res, 200, { success: true, order_id, status_updated: status });
  } catch (err) {
    console.error('Fulfillment Result Error:', err);
    return sendJson(res, 500, { error: 'internal_error', details: err.message });
  }
};
