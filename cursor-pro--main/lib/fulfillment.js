
// lib/fulfillment.js
const { updateOrderByOrderId, getOrderByOrderId } = require('./supabase');
const { purchaseKey } = require('./vendor');
const { sendEmail } = require('./mail');
const { triggerAgentWebhook } = require('./webhook');

/**
 * Process an order for fulfillment (purchase key and update DB).
 * @param {string} orderId - The order ID to process.
 * @param {boolean} force - Whether to force processing even if not fully paid (admin override).
 * @returns {Promise<{success: boolean, message: string, key?: string}>}
 */
async function processOrder(orderId, force = false) {
  console.log(`[Fulfillment] Processing order: ${orderId}`);
  
  try {
    const order = await getOrderByOrderId(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if already delivered
    if (order.is_delivered && order.license_key) {
      return { success: true, message: 'Already delivered', key: order.license_key };
    }

    // Check payment status (unless forced)
    const isPaid = order.c2p_status === 'paid' || order.np_status === 'finished' || order.np_status === 'confirmed';
    if (!isPaid && !force) {
      return { success: false, message: `Payment not confirmed (c2p: ${order.c2p_status || 'none'}, np: ${order.np_status || 'none'})` };
    }

    // Update status to 'purchasing'
    await updateOrderByOrderId(orderId, {
      delivery_status: 'purchasing',
      updated_at: new Date().toISOString()
    });

    // 1. Purchase from vendor
    let result;
    try {
      result = await purchaseKey(order.plan);
    } catch (vendorError) {
      console.error(`[Fulfillment] Vendor error for ${orderId}:`, vendorError);
      // If vendor fails, we can trigger agent fallback immediately or just mark failed
      // For now, mark failed and let retry logic or manual intervention handle it
      await updateOrderByOrderId(orderId, {
        delivery_status: 'failed',
        last_procurement_error: vendorError.message,
        updated_at: new Date().toISOString()
      });
      return { success: false, message: `Vendor purchase failed: ${vendorError.message}` };
    }

    // 2. Send Email (Main Channel)
    let emailSent = false;
    try {
      const subject = `Your License Key for ${order.plan} Plan`;
      const text = `Thank you for your purchase!\n\nYour License Key: ${result.key}\n\nOrder ID: ${orderId}`;
      const html = `<p>Thank you for your purchase!</p><p>Your License Key: <strong>${result.key}</strong></p><p>Order ID: ${orderId}</p>`;
      
      emailSent = await sendEmail(order.email, subject, text, html);
      
      await updateOrderByOrderId(orderId, {
        mail_attempts: (order.mail_attempts || 0) + 1,
        mail_last_error: emailSent ? null : 'SMTP failed',
      });
    } catch (emailErr) {
      console.error(`[Fulfillment] Email error for ${orderId}:`, emailErr);
      await updateOrderByOrderId(orderId, {
        mail_attempts: (order.mail_attempts || 0) + 1,
        mail_last_error: emailErr.message
      });
    }

    // 3. Fallback to Agent if Email failed
    if (!emailSent) {
      console.log(`[Fulfillment] SMTP failed, triggering Agent fallback for ${orderId}`);
      try {
        await triggerAgentWebhook(order);
        await updateOrderByOrderId(orderId, {
          fallback_attempts: (order.fallback_attempts || 0) + 1,
          delivered_via: 'agent_fallback'
        });
      } catch (agentErr) {
        console.error(`[Fulfillment] Agent fallback failed for ${orderId}:`, agentErr);
      }
    } else {
       await updateOrderByOrderId(orderId, {
          delivered_via: 'smtp'
       });
    }

    // Success! Update DB
    try {
      await updateOrderByOrderId(orderId, {
        license_key: result.key,
        is_delivered: true,
        delivery_status: 'delivered',
        fulfilled_at: new Date().toISOString(),
        vendor_order_id: result.vendor_order_id,
        updated_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error(`[Fulfillment] CRITICAL: Purchased key ${result.key} for order ${orderId} but failed to save to DB!`, dbError);
      throw dbError;
    }

    console.log(`[Fulfillment] Order ${orderId} delivered successfully.`);
    return { success: true, message: 'Delivered', key: result.key };

  } catch (err) {
    console.error(`[Fulfillment] Critical error for ${orderId}:`, err);
    try {
      await updateOrderByOrderId(orderId, {
        delivery_status: 'system_error',
        delivery_info: JSON.stringify({ error: err.message }),
        updated_at: new Date().toISOString()
      });
    } catch (e) {}
    return { success: false, message: `System error: ${err.message}` };
  }
}

module.exports = { processOrder };
