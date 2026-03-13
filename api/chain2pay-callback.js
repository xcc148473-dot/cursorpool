const crypto = require('crypto');
const { sendJson, handleCors } = require('../lib/utils');
const { getOrderByOrderId, updateOrderByOrderId } = require('../lib/supabase');
// Removed lib/chain2pay dependency
const { triggerAgentWebhook } = require('../lib/webhook');
const { notifyPaid } = require('../lib/feishu');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'method_not_allowed', message: 'Only GET is allowed' });
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const localOrderId = urlObj.searchParams.get('order_id');
  const sig = urlObj.searchParams.get('sig');
  const txidOut = urlObj.searchParams.get('txid_out');
  const valueCoin = urlObj.searchParams.get('value_coin');
  const coin = urlObj.searchParams.get('coin');

  if (!localOrderId) {
    return sendJson(res, 400, { error: 'missing_order_id' });
  }

  try {
    const order = await getOrderByOrderId(localOrderId);
    if (!order) {
      return sendJson(res, 404, { error: 'order_not_found' });
    }

    const merchantWallet = process.env.PAYGATE_MERCHANT_WALLET;
    if (!merchantWallet) {
      throw new Error('PAYGATE_MERCHANT_WALLET is not configured');
    }
    const secret = crypto.createHash('sha256').update(`paygate_salt_${merchantWallet}`).digest('hex');
    const expectedSig = crypto.createHmac('sha256', secret).update(localOrderId).digest('hex');
    const sigOk = !!sig && sig.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));

    if (!sigOk) {
      return sendJson(res, 403, { error: 'invalid_signature' });
    }

    // 先记录回调参数（审计）
    await updateOrderByOrderId(localOrderId, {
      c2p_txid_out: txidOut || order.c2p_txid_out || null,
      c2p_value_coin: valueCoin || order.c2p_value_coin || null,
      c2p_coin: coin || order.c2p_coin || null,
      c2p_callback_raw: JSON.stringify(Object.fromEntries(urlObj.searchParams.entries())),
      updated_at: new Date().toISOString(),
    });

    // PayGate 回调侧按文档只给 value_coin，这里采用 >= 60% 的保守阈值确认
    const expected = Number(order.price_amount || 0);
    const received = Number(valueCoin || 0);
    const paid = Number.isFinite(received) && received >= expected * 0.6;

    if (paid) {
      const latestOrder = await getOrderByOrderId(localOrderId);
      if (latestOrder && !latestOrder.is_delivered) {
        await updateOrderByOrderId(localOrderId, {
          c2p_status: 'paid',
          np_status: 'finished',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await notifyPaid(localOrderId, latestOrder.plan, latestOrder.price_amount, latestOrder.email);
        await triggerAgentWebhook({ ...latestOrder, np_status: 'finished' }, localOrderId);
      } else {
        await updateOrderByOrderId(localOrderId, {
          c2p_status: 'paid',
          np_status: 'finished',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        await notifyPaid(localOrderId, order.plan, order.price_amount, order.email);
      }
    }

    return sendJson(res, 200, {
      received: true,
      order_id: localOrderId,
      verified: paid,
      status: paid ? 'paid' : 'unpaid',
    });
  } catch (err) {
    console.error('PayGate callback failed:', err);
    return sendJson(res, 200, {
      received: true,
      processed: false,
      error: err.message || 'callback_error',
    });
  }
};
