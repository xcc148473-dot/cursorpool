
// lib/webhook.js
// Client for triggering Agent Webhook

const { getEnv } = require('./utils');
// Fix: Import getOrderByOrderId from supabase, not utils
const { getOrderByOrderId } = require('./supabase');

/**
 * Trigger Agent Webhook for fulfillment.
 * @param {object} order - The order object from database.
 * @returns {Promise<{success: boolean, message: string, status: number, body: string}>}
 */
async function triggerAgentWebhook(order) {
  const orderId = order.order_id;
  console.log(`[Webhook] Triggering agent for order: ${orderId}`);
  
  try {
    const webhookUrl = getEnv('AGENT_WEBHOOK_URL', { required: true });
    const webhookToken = getEnv('AGENT_WEBHOOK_TOKEN', { required: true });

    // Construct payload as requested
    const payload = {
      event: "order.paid",
      order_id: order.order_id,
      email: order.email,
      plan: order.plan,
      amount: Number(order.price_amount),
      currency: order.price_currency,
      paid_at: new Date().toISOString(),
      source: order.c2p_order_id ? "chain2pay" : "nowpayments",
      meta: {
        np_payment_id: order.np_payment_id,
        np_invoice_id: order.np_invoice_id,
        c2p_order_id: order.c2p_order_id,
        c2p_ipn_token: order.c2p_ipn_token,
        c2p_txid_out: order.c2p_txid_out
      }
    };

    console.log(`[Webhook] Sending payload to ${webhookUrl}`, payload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookToken}`,
        'X-Request-Id': order.order_id
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Agent webhook failed: ${response.status} ${text}`);
    }

    console.log(`[Webhook] Successfully triggered agent for ${orderId}`);
    return { success: true, message: 'Agent triggered', status: response.status, body: text };

  } catch (err) {
    console.error(`[Webhook] Failed to trigger agent for ${orderId}:`, err);
    throw err;
  }
}

module.exports = { triggerAgentWebhook };
