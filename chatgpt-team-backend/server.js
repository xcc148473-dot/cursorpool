const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');
const {
  listProducts,
  getProductById,
  insertBusinessOrder,
  updateBusinessOrderByOrderId,
  getBusinessOrderByOrderId,
  listBusinessOrders,
  insertMessage,
  listMessagesByOrderId,
} = require('./lib-supabase');

const PORT = process.env.PORT || 3100;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const PAYMENT_BACKEND_BASE = process.env.PAYMENT_BACKEND_BASE || 'http://127.0.0.1:3001';
const FRONTEND_SITE_URL = process.env.FRONTEND_SITE_URL || 'http://127.0.0.1:3200';

function send(res, code, body, headers = {}) { res.writeHead(code, headers); res.end(body); }
function json(res, payload, code = 200) {
  send(res, code, JSON.stringify(payload), {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret'
  });
}
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const i = v.indexOf('='); return [v.slice(0, i), decodeURIComponent(v.slice(i + 1))];
  }));
}
function authAdmin(req) {
  const cookies = parseCookies(req);
  const header = req.headers['x-admin-secret'] || req.headers['authorization'];
  return cookies.admin_secret === ADMIN_SECRET || header === ADMIN_SECRET || header === `Bearer ${ADMIN_SECRET}`;
}
async function parseBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return Object.fromEntries(new URLSearchParams(raw)); }
}
async function serializeOrder(order) {
  const messages = await listMessagesByOrderId(order.order_id);
  return {
    id: order.id,
    orderId: order.order_id,
    productId: order.product_id,
    customerName: order.customer_name,
    email: order.email,
    contact: order.contact,
    paymentPlanId: order.payment_plan_id,
    paymentMethod: order.payment_method,
    amountUsd: order.amount_usd,
    status: order.status,
    fulfillmentStatus: order.fulfillment_status,
    deliveryMessage: order.delivery_message,
    paymentProvider: order.payment_provider,
    paymentUrl: order.payment_url,
    returnUrl: order.return_url,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    messages,
  };
}
async function proxyCreatePayment(order) {
  const res = await fetch(`${PAYMENT_BACKEND_BASE.replace(/\/$/, '')}/api/checkout`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: order.email,
      plan: order.paymentPlanId,
      payment_method: order.paymentMethod || 'fiat',
      site_url: FRONTEND_SITE_URL,
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'payment_backend_error');
  return data;
}
async function proxyPaymentStatus(orderId, email) {
  const res = await fetch(`${PAYMENT_BACKEND_BASE.replace(/\/$/, '')}/api/check-order-status?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'payment_status_error');
  return data;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, { ok: true }, 204);
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, { ok: true, service: 'chatgpt-team-backend' });

    if (req.method === 'GET' && url.pathname === '/api/products') {
      const products = await listProducts();
      return json(res, { ok: true, products });
    }

    if (req.method === 'POST' && url.pathname === '/api/orders/create') {
      const body = await parseBody(req);
      if (!body.email) return json(res, { error: 'missing_email' }, 400);
      const product = await getProductById(body.productId || 'gpt_team_30d');
      if (!product) return json(res, { error: 'product_not_found' }, 404);

      const draft = {
        email: body.email,
        paymentPlanId: product.payment_plan_id,
        paymentMethod: product.payment_method,
      };
      const payment = await proxyCreatePayment(draft);

      const stored = await insertBusinessOrder({
        order_id: payment.order_id,
        product_id: product.id,
        customer_name: body.customerName || '',
        email: body.email,
        contact: body.contact || '',
        payment_plan_id: product.payment_plan_id,
        payment_method: product.payment_method,
        amount_usd: product.price_usd,
        status: 'pending_payment',
        fulfillment_status: 'pending',
        delivery_message: '',
        payment_provider: payment.provider || null,
        payment_url: payment.payment_url || null,
        return_url: payment.return_url || null,
      });

      return json(res, { ok: true, order: await serializeOrder(stored), payment });
    }

    if (req.method === 'GET' && url.pathname === '/api/orders/status') {
      const orderId = url.searchParams.get('order_id');
      const email = url.searchParams.get('email');
      if (!orderId || !email) return json(res, { error: 'missing_params' }, 400);
      const order = await getBusinessOrderByOrderId(orderId);
      if (!order || String(order.email).toLowerCase() !== String(email).toLowerCase()) return json(res, { error: 'order_not_found' }, 404);

      const paymentStatus = await proxyPaymentStatus(orderId, email);
      const patch = { updated_at: new Date().toISOString() };
      if (paymentStatus.status === 'completed') {
        patch.status = 'completed';
        patch.fulfillment_status = 'delivered';
        patch.delivery_message = paymentStatus.delivery_message || paymentStatus.key || order.delivery_message || '';
      } else if (paymentStatus.status === 'processing') {
        patch.status = 'processing';
      } else {
        patch.status = 'pending_payment';
      }
      const updated = await updateBusinessOrderByOrderId(orderId, patch);
      return json(res, { ok: true, order: await serializeOrder(updated), paymentStatus });
    }

    if (req.method === 'GET' && url.pathname === '/api/support') {
      const orderId = url.searchParams.get('order_id');
      const email = url.searchParams.get('email');
      if (!orderId || !email) return json(res, { error: 'missing_params' }, 400);
      const order = await getBusinessOrderByOrderId(orderId);
      if (!order || String(order.email).toLowerCase() !== String(email).toLowerCase()) return json(res, { ok: true, messages: [] });
      return json(res, { ok: true, messages: await listMessagesByOrderId(orderId) });
    }

    if (req.method === 'POST' && url.pathname === '/api/support') {
      const body = await parseBody(req);
      if (!body.order_id || !body.email || !body.message) return json(res, { error: 'missing_fields' }, 400);
      const order = await getBusinessOrderByOrderId(body.order_id);
      if (!order || String(order.email).toLowerCase() !== String(body.email).toLowerCase()) return json(res, { error: 'order_not_found' }, 404);
      const msg = await insertMessage({ order_id: body.order_id, email: body.email, sender: 'customer', message: body.message });
      await updateBusinessOrderByOrderId(body.order_id, { updated_at: new Date().toISOString() });
      return json(res, { ok: true, message: msg });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      const body = await parseBody(req);
      if (body.adminSecret !== ADMIN_SECRET) return json(res, { error: 'unauthorized' }, 401);
      send(res, 200, JSON.stringify({ ok: true }), {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `admin_secret=${encodeURIComponent(ADMIN_SECRET)}; HttpOnly; Path=/; SameSite=Lax`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret'
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/orders') {
      if (!authAdmin(req)) return json(res, { error: 'unauthorized' }, 401);
      const orders = await listBusinessOrders(100);
      const full = [];
      for (const order of orders) full.push(await serializeOrder(order));
      return json(res, { ok: true, orders: full });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/support-reply') {
      if (!authAdmin(req)) return json(res, { error: 'unauthorized' }, 401);
      const body = await parseBody(req);
      if (!body.order_id || !body.message) return json(res, { error: 'missing_fields' }, 400);
      const order = await getBusinessOrderByOrderId(body.order_id);
      if (!order) return json(res, { error: 'order_not_found' }, 404);
      const msg = await insertMessage({ order_id: body.order_id, email: order.email, sender: 'admin', message: body.message });
      await updateBusinessOrderByOrderId(body.order_id, { updated_at: new Date().toISOString() });
      return json(res, { ok: true, message: msg });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/mark-delivered') {
      if (!authAdmin(req)) return json(res, { error: 'unauthorized' }, 401);
      const body = await parseBody(req);
      const order = await getBusinessOrderByOrderId(body.order_id);
      if (!order) return json(res, { error: 'order_not_found' }, 404);
      const updated = await updateBusinessOrderByOrderId(body.order_id, {
        fulfillment_status: 'delivered',
        status: 'completed',
        delivery_message: body.delivery_message || 'Your account has been added to the ChatGPT Business team workspace.',
        updated_at: new Date().toISOString()
      });
      return json(res, { ok: true, order: await serializeOrder(updated) });
    }

    return json(res, { error: 'not_found' }, 404);
  } catch (err) {
    console.error('chatgpt-team-backend error:', err);
    return json(res, { error: 'internal_error', message: err.message }, 500);
  }
});

server.listen(PORT, () => console.log(`chatgpt-team-backend running on http://127.0.0.1:${PORT}`));
