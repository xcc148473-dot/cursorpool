const { sendJson, getHeader, getEnv, handleCors } = require('../lib/utils');
const { verifyNowpaymentsSignature, parseAndSortBody } = require('../lib/ipnVerify');
const { updateOrderByOrderId, getOrderByOrderId } = require('../lib/supabase');
const { triggerAgentWebhook } = require('../lib/webhook');
const { notifyPaid } = require('../lib/feishu');

// 注意：NOWPayments 官方文档提到的通知服务器 IP（示例，实际请以官方为准）：
// 3.248.40.18
// 34.253.91.119
// 3.248.172.191
// 34.247.92.2

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed', message: 'Only POST is allowed' });
  }

  // 手动读取 raw body
  let rawBody = '';
  try {
    for await (const chunk of req) {
      rawBody += chunk;
    }
  } catch (e) {
    console.error('Failed to read raw body:', e);
    return sendJson(res, 400, { error: 'invalid_body', message: 'Unable to read request body' });
  }

  const signature = getHeader(req, 'x-nowpayments-sig');
  if (!signature) {
    return sendJson(res, 401, { error: 'missing_signature', message: 'x-nowpayments-sig header is required' });
  }

  const ipnSecret = getEnv('NOWPAYMENTS_IPN_SECRET', { required: true });

  // 验签
  let sortedBodyString;
  let parsed;
  try {
    const parsedResult = parseAndSortBody(rawBody);
    sortedBodyString = parsedResult.sortedString;
    parsed = parsedResult.parsed;
    const ok = verifyNowpaymentsSignature(sortedBodyString, signature, ipnSecret);
    if (!ok) {
      return sendJson(res, 401, { error: 'invalid_signature', message: 'Signature verification failed' });
    }
  } catch (err) {
    console.error('IPN verify error:', err);
    return sendJson(res, 400, { error: 'verification_error', message: 'Failed to verify IPN body' });
  }

  const paymentStatus = parsed.payment_status;
  const orderId = parsed.order_id;
  const paymentId = parsed.payment_id;

  if (!orderId) {
    return sendJson(res, 400, { error: 'missing_order_id', message: 'order_id is required in IPN payload' });
  }

  // 只更新订单的支付状态
  try {
    await updateOrderByOrderId(orderId, {
      np_status: paymentStatus || null,
      np_payment_id: paymentId ? String(paymentId) : null,
    });

    // 如果支付完成，触发发货流程
    let fulfillmentResult = null;

    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      try {
        console.log(`[IPN] Payment confirmed for ${orderId}. Checking delivery status...`);
        
        // 重新获取订单最新状态，防止重复触发
        const order = await getOrderByOrderId(orderId);
        
        if (order) {
           // 触发飞书通知 (无论是否已发货，只要支付成功就通知，方便审计)
           // 但为了避免刷屏，也许应该只在首次支付成功时通知？
           // 这里的逻辑是每次 IPN 收到 finished 都会触发。通常 IPN 会重试直到 200 OK。
           // 我们下面会返回 200，所以应该只会触发一次（除非并发）。
           // 放在这里是安全的。
           await notifyPaid(orderId, order.plan, order.price_amount, order.email);

           if (!order.is_delivered) {
             // 仅当未发货时触发 Webhook
             console.log(`[IPN] Order ${orderId} not delivered yet. Triggering agent webhook...`);
             const webhookResult = await triggerAgentWebhook(order, orderId);
             fulfillmentResult = { success: webhookResult };
           } else {
             console.log(`[IPN] Order ${orderId} already delivered.`);
             fulfillmentResult = { success: true, message: 'already_delivered' };
           }
        }
        
      } catch (fErr) {
        console.error(`[IPN] Fulfillment failed for ${orderId}:`, fErr);
      }
    }

    return sendJson(res, 200, {
      received: true,
      processed: true,
      status_updated: true,
      fulfillment: fulfillmentResult ? fulfillmentResult.success : 'failed_or_skipped'
    });
  } catch (e) {
    console.error('Failed to update order status from IPN:', e);
    // 即使更新失败，也返回 200，避免 NOWPayments 无限重试
    return sendJson(res, 200, {
      received: true,
      processed: false,
      error: 'update_order_failed',
      details: e && e.message ? e.message : String(e),
    });
  }
};


