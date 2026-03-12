const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3100;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const PAYMENT_BACKEND_BASE = process.env.PAYMENT_BACKEND_BASE || 'http://127.0.0.1:3001';
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const seed = {
      products: [
        {
          id: 'gpt_team_30d',
          title: 'ChatGPT Business Team Shared Seat',
          priceUsd: 10,
          paymentPlanId: 'gpt_team_30d',
          paymentMethod: 'fiat',
          description: 'Shared seat in a ChatGPT Business team workspace. You use your own email/account, and we add you to the active workspace after payment.'
        }
      ],
      businessOrders: [],
      messages: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  }
}
function readDb() { ensureDb(); return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDb(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function send(res, code, body, headers = {}) { res.writeHead(code, headers); res.end(body); }
function json(res, payload, code = 200) { send(res, code, JSON.stringify(payload), { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret' }); }
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(v => { const i = v.indexOf('='); return [v.slice(0, i), decodeURIComponent(v.slice(i + 1))]; }));
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
function getMessages(db, orderId) { return db.messages.filter(m => m.orderId === orderId).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)); }
function serializeOrder(order, db) { return { ...order, messages: getMessages(db, order.orderId) }; }
async function proxyCreatePayment(order) {
  const res = await fetch(`${PAYMENT_BACKEND_BASE.replace(/\/$/, '')}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: order.email,
      plan: order.paymentPlanId,
      payment_method: order.paymentMethod || 'fiat'
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'payment_backend_error');
  return data;
}
async function proxyPaymentStatus(orderId, email) {
  const url = `${PAYMENT_BACKEND_BASE.replace(/\/$/, '')}/api/check-order-status?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'payment_status_error');
  return data;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, { ok: true }, 204);
  const db = readDb();
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, { ok: true, service: 'chatgpt-team-backend' });
  if (req.method === 'GET' && url.pathname === '/api/products') return json(res, { ok: true, products: db.products });

  if (req.method === 'POST' && url.pathname === '/api/orders/create') {
    try {
      const body = await parseBody(req);
      if (!body.email) return json(res, { error: 'missing_email' }, 400);
      const product = db.products.find(p => p.id === (body.productId || 'gpt_team_30d'));
      if (!product) return json(res, { error: 'product_not_found' }, 404);

      const businessOrder = {
        id: crypto.randomUUID(),
        orderId: null,
        productId: product.id,
        customerName: body.customerName || '',
        email: body.email,
        contact: body.contact || '',
        paymentPlanId: product.paymentPlanId,
        paymentMethod: product.paymentMethod,
        amountUsd: product.priceUsd,
        status: 'pending_payment',
        fulfillmentStatus: 'pending',
        deliveryMessage: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const payment = await proxyCreatePayment(businessOrder);
      businessOrder.orderId = payment.order_id;
      businessOrder.paymentProvider = payment.provider || null;
      businessOrder.paymentUrl = payment.payment_url || null;
      businessOrder.returnUrl = payment.return_url || null;
      db.businessOrders.push(businessOrder);
      writeDb(db);
      return json(res, { ok: true, order: businessOrder, payment });
    } catch (err) {
      return json(res, { error: 'create_order_failed', message: err.message }, 500);
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/orders/status') {
    const orderId = url.searchParams.get('order_id');
    const email = url.searchParams.get('email');
    if (!orderId || !email) return json(res, { error: 'missing_params' }, 400);
    const order = db.businessOrders.find(o => o.orderId === orderId && o.email.toLowerCase() === email.toLowerCase());
    if (!order) return json(res, { error: 'order_not_found' }, 404);
    try {
      const paymentStatus = await proxyPaymentStatus(orderId, email);
      if (paymentStatus.status === 'completed') {
        order.status = 'completed';
        order.fulfillmentStatus = 'delivered';
        order.deliveryMessage = paymentStatus.delivery_message || paymentStatus.key || order.deliveryMessage || '';
      } else if (paymentStatus.status === 'processing') {
        order.status = 'processing';
      } else {
        order.status = 'pending_payment';
      }
      order.updatedAt = new Date().toISOString();
      writeDb(db);
      return json(res, { ok: true, order: serializeOrder(order, db), paymentStatus });
    } catch (err) {
      return json(res, { error: 'status_failed', message: err.message }, 500);
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/support') {
    const orderId = url.searchParams.get('order_id');
    const email = url.searchParams.get('email');
    if (!orderId || !email) return json(res, { error: 'missing_params' }, 400);
    const order = db.businessOrders.find(o => o.orderId === orderId && o.email.toLowerCase() === email.toLowerCase());
    if (!order) return json(res, { ok: true, messages: [] });
    return json(res, { ok: true, messages: getMessages(db, orderId) });
  }

  if (req.method === 'POST' && url.pathname === '/api/support') {
    const body = await parseBody(req);
    if (!body.order_id || !body.email || !body.message) return json(res, { error: 'missing_fields' }, 400);
    const order = db.businessOrders.find(o => o.orderId === body.order_id && o.email.toLowerCase() === body.email.toLowerCase());
    if (!order) return json(res, { error: 'order_not_found' }, 404);
    const msg = { id: crypto.randomUUID(), orderId: body.order_id, email: body.email, sender: 'customer', message: body.message, createdAt: new Date().toISOString() };
    db.messages.push(msg);
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return json(res, { ok: true, message: msg });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await parseBody(req);
    if (body.adminSecret !== ADMIN_SECRET) return json(res, { error: 'unauthorized' }, 401);
    send(res, 200, JSON.stringify({ ok: true }), { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': `admin_secret=${encodeURIComponent(ADMIN_SECRET)}; HttpOnly; Path=/; SameSite=Lax`, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/orders') {
    if (!authAdmin(req)) return json(res, { error: 'unauthorized' }, 401);
    return json(res, { ok: true, orders: db.businessOrders.map(o => serializeOrder(o, db)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/support-reply') {
    if (!authAdmin(req)) return json(res, { error: 'unauthorized' }, 401);
    const body = await parseBody(req);
    if (!body.order_id || !body.message) return json(res, { error: 'missing_fields' }, 400);
    const order = db.businessOrders.find(o => o.orderId === body.order_id);
    if (!order) return json(res, { error: 'order_not_found' }, 404);
    const msg = { id: crypto.randomUUID(), orderId: body.order_id, email: order.email, sender: 'admin', message: body.message, createdAt: new Date().toISOString() };
    db.messages.push(msg);
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return json(res, { ok: true, message: msg });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/mark-delivered') {
    if (!authAdmin(req)) return json(res, { error: 'unauthorized' }, 401);
    const body = await parseBody(req);
    const order = db.businessOrders.find(o => o.orderId === body.order_id);
    if (!order) return json(res, { error: 'order_not_found' }, 404);
    order.fulfillmentStatus = 'delivered';
    order.status = 'completed';
    order.deliveryMessage = body.delivery_message || 'Your account has been added to the ChatGPT Business team workspace.';
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    return json(res, { ok: true, order });
  }

  return json(res, { error: 'not_found' }, 404);
});

server.listen(PORT, () => {
  ensureDb();
  console.log(`chatgpt-team-backend running on http://127.0.0.1:${PORT}`);
});
