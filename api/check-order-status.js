const { sendJson, handleCors } = require('../lib/utils');
const { getOrderByOrderId } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const orderId = urlObj.searchParams.get('order_id');
  const email = urlObj.searchParams.get('email'); // Mandatory for security

  if (!orderId || !email) {
    return sendJson(res, 400, { error: 'missing_params', message: 'Both order_id and email are required' });
  }

  try {
    const order = await getOrderByOrderId(orderId);

    if (!order) {
      // Return pending to avoid leaking existence of order ID
      return sendJson(res, 200, { status: 'pending' });
    }

    // Security Check: Verify email matches
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      // Fake response to prevent enumeration
      return sendJson(res, 200, { status: 'pending' });
    }

    // Completed if delivered. For ChatGPT team seats, prefer delivery_message.
    if (order.is_delivered) {
      const deliveryMessage = order.delivery_message || null;
      if (deliveryMessage) {
        return sendJson(res, 200, {
          status: 'completed',
          delivery_message: deliveryMessage,
          delivered_at: order.paid_at || order.updated_at || null,
        });
      }

      if (order.license_key) {
        return sendJson(res, 200, { status: 'completed', key: order.license_key });
      }

      return sendJson(res, 200, {
        status: 'completed',
        delivery_message: 'Your order has been completed successfully.',
      });
    }

    const paid = order.c2p_status === 'paid' || order.np_status === 'finished' || order.np_status === 'confirmed';
    if (paid) {
      return sendJson(res, 200, { status: 'processing' });
    }

    return sendJson(res, 200, { status: 'pending' });
  } catch (err) {
    console.error('Error in check-order-status:', err);
    return sendJson(res, 500, { error: 'internal_error' });
  }
};
