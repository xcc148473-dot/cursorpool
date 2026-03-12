const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
const SITE_URL = process.env.SITE_URL || `http://127.0.0.1:${PORT}`;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const seed = {
      product: {
        id: 'chatgpt-business-team-seat',
        name: 'ChatGPT Business Team Shared Seat',
        priceUsd: 10,
        description: 'Shared seat in a ChatGPT Business team workspace. You use your own email/account and we add you to the active workspace after payment.'
      },
      orders: [
        {
          orderNo: 'ORD-DEMO-1001',
          customerName: 'Demo Buyer',
          email: 'demo@example.com',
          contact: '@demo',
          amountUsd: 10,
          paymentStatus: 'paid',
          deliveryStatus: 'processing',
          note: 'Waiting for workspace invite confirmation.',
          createdAt: new Date().toISOString(),
          trackingToken: crypto.randomBytes(16).toString('hex')
        }
      ],
      messages: [
        { id: crypto.randomUUID(), orderNo: 'ORD-DEMO-1001', sender: 'customer', content: 'Hi, I paid already. When will my seat be added?', createdAt: new Date().toISOString() },
        { id: crypto.randomUUID(), orderNo: 'ORD-DEMO-1001', sender: 'admin', content: 'Payment confirmed. We are processing it and will update you here.', createdAt: new Date().toISOString() }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  }
}
function readDb() { ensureDb(); return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDb(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function getCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const i = v.indexOf('='); return [v.slice(0, i), decodeURIComponent(v.slice(i + 1))];
  }));
}
function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      const type = req.headers['content-type'] || '';
      if (type.includes('application/json')) return resolve(data ? JSON.parse(data) : {});
      if (type.includes('application/x-www-form-urlencoded')) return resolve(Object.fromEntries(new URLSearchParams(data)));
      resolve({ raw: data });
    });
  });
}
function send(res, status, body, headers = {}) {
  res.writeHead(status, headers); res.end(body);
}
function json(res, payload, status = 200) {
  send(res, status, JSON.stringify(payload), { 'Content-Type': 'application/json; charset=utf-8' });
}
function redirect(res, location, headers = {}) {
  send(res, 302, '', { Location: location, ...headers });
}
function esc(v = '') { return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
function layout(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${esc(title)}</title><style>
  body{margin:0;font-family:Arial,sans-serif;background:#0b1020;color:#eef2ff}a{text-decoration:none;color:inherit}.container{width:min(1100px,calc(100% - 32px));margin:0 auto}.header{display:flex;justify-content:space-between;align-items:center;padding:18px 0}.header nav{display:flex;gap:16px}.card{background:#141b31;border:1px solid #2c3760;border-radius:18px;padding:20px}.grid{display:grid;gap:20px}.two{grid-template-columns:1.2fr .8fr}.section{padding:18px 0}.btn,button{border:0;border-radius:12px;padding:12px 16px;font-weight:700;cursor:pointer}.primary{background:#6ea8fe;color:#081224}.secondary{background:transparent;border:1px solid #2c3760;color:#eef2ff}.price{font-size:52px;font-weight:800}.muted,p,li,label,td,th{color:#a6b6dd}.badge{display:inline-block;padding:8px 12px;border-radius:999px;background:#142544;color:#6ea8fe;border:1px solid #284474;font-size:14px}table{width:100%;border-collapse:collapse}td,th{padding:10px 8px;border-bottom:1px solid #2c3760;text-align:left;vertical-align:top}input,textarea,select{width:100%;padding:12px 14px;border-radius:12px;border:1px solid #2c3760;background:#0d1327;color:#eef2ff;margin-top:8px}textarea{min-height:100px}.messages{display:grid;gap:12px;margin-top:16px}.msg{padding:14px;border-radius:14px;border:1px solid #2c3760;background:#0d1327}.admin{border-color:#6ea8fe}.status{display:inline-block;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:700}.paid,.delivered{background:#17352c;color:#8bf0c6}.pending,.processing,.new{background:#3c3314;color:#ffd166}.failed,.cancelled{background:#3f1d28;color:#ff8585}.code{font-family:monospace;background:#1c2543;padding:2px 8px;border-radius:999px}@media(max-width:900px){.two{grid-template-columns:1fr}}</style></head><body><main class="container">${body}</main></body></html>`;
}
function getOrder(db, orderNo, email) { return db.orders.find(o => o.orderNo === orderNo && (!email || o.email.toLowerCase() === String(email).toLowerCase())); }
function getMessages(db, orderNo) { return db.messages.filter(m => m.orderNo === orderNo).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)); }
function createOrder(db, body) {
  const orderNo = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*9000+1000)}`;
  const order = { orderNo, customerName: body.customerName, email: body.email, contact: body.contact, amountUsd: db.product.priceUsd, paymentStatus: 'pending', deliveryStatus: 'new', note: '', createdAt: new Date().toISOString(), trackingToken: crypto.randomBytes(16).toString('hex') };
  db.orders.push(order); writeDb(db); return order;
}
function homePage(db) {
  return layout('Team Seat MVP', `<div class="header"><div class="badge">Minimal MVP</div><nav><a href="/track">Track order</a><a href="/admin">Admin</a></nav></div>
  <section class="section grid two"><div class="card"><div class="badge">$10 offer</div><h1>ChatGPT Business Team shared seat</h1><p>${esc(db.product.description)}</p><div class="price">$${db.product.priceUsd}</div><p>This MVP lets a buyer create an order, pay via your external backend, then track delivery and message you.</p><p><a class="btn primary primary" href="/checkout">Buy now</a> <a class="btn secondary secondary" href="/track">Track order</a></p><ul><li>Clear English product wording</li><li>Customer support messages tied to each order</li><li>Admin panel to update delivery and payment status</li></ul></div>
  <div class="card"><h2>Product wording</h2><p>${esc(db.product.description)}</p><h3>Current price</h3><p class="price">$10</p><p class="muted">This is described as a shared team seat, not a direct official subscription sale.</p></div></section>`);
}
function checkoutPage() {
  return layout('Checkout', `<div class="header"><a href="/">← Home</a></div><section class="section"><div class="card" style="max-width:760px;margin:0 auto"><h1>Checkout</h1><p>Collect buyer details, then hand off to your payment backend.</p><form method="post" action="/checkout"><label>Name<input name="customerName" required></label><label>Email<input type="email" name="email" required></label><label>Contact handle<input name="contact" placeholder="Telegram / WhatsApp / Discord / X" required></label><button class="primary" type="submit">Create order</button></form></div></section>`);
}
function trackPage(query, db, order = null, error = '') {
  const messages = order ? getMessages(db, order.orderNo) : [];
  return layout('Track order', `<div class="header"><a href="/">← Home</a></div><section class="section grid two"><div class="card"><h1>Track your order</h1><p>Enter your order number and email to view the order and message support.</p><form method="get" action="/track"><label>Order number<input name="orderNo" value="${esc(query.orderNo || '')}" required></label><label>Email<input type="email" name="email" value="${esc(query.email || '')}" required></label><button class="primary" type="submit">View order</button></form>${error ? `<p style="color:#ff8585">${esc(error)}</p>` : ''}</div><div class="card"><h2>Demo order</h2><p>Order: <span class="code">ORD-DEMO-1001</span><br>Email: <span class="code">demo@example.com</span></p></div></section>
  ${order ? `<section class="section grid two"><div class="card"><h2>Order details</h2><table><tbody><tr><th>Order</th><td>${esc(order.orderNo)}</td></tr><tr><th>Email</th><td>${esc(order.email)}</td></tr><tr><th>Contact</th><td>${esc(order.contact)}</td></tr><tr><th>Payment</th><td><span class="status ${esc(order.paymentStatus)}">${esc(order.paymentStatus)}</span></td></tr><tr><th>Delivery</th><td><span class="status ${esc(order.deliveryStatus)}">${esc(order.deliveryStatus)}</span></td></tr><tr><th>Amount</th><td>$${esc(order.amountUsd)}</td></tr><tr><th>Note</th><td>${esc(order.note || '-')}</td></tr></tbody></table></div>
  <div class="card"><h2>Message support</h2><form method="post" action="/message"><input type="hidden" name="orderNo" value="${esc(order.orderNo)}"><input type="hidden" name="email" value="${esc(order.email)}"><label>Your message<textarea name="content" required></textarea></label><button class="primary" type="submit">Send message</button></form><div class="messages">${messages.map(m=>`<div class="msg ${m.sender==='admin'?'admin':''}"><strong>${m.sender==='admin'?'Support':'You'}</strong><p>${esc(m.content)}</p><div class="muted">${new Date(m.createdAt).toLocaleString()}</div></div>`).join('')}</div></div></section>` : ''}`);
}
function adminPage(db, authed) {
  if (!authed) return layout('Admin', `<div class="header"><a href="/">← Home</a></div><section class="section"><div class="card" style="max-width:520px;margin:0 auto"><h1>Admin access</h1><form method="post" action="/admin/login"><label>Admin key<input type="password" name="adminKey" required></label><button class="primary" type="submit">Open dashboard</button></form></div></section>`);
  return layout('Admin dashboard', `<div class="header"><h1>Admin dashboard</h1><div>${db.orders.length} orders</div></div><section class="section">${db.orders.map(o=>{const msgs=getMessages(db,o.orderNo);return `<div class="card" style="margin-bottom:18px"><div class="grid two"><div><h2>${esc(o.orderNo)}</h2><p>${esc(o.customerName)} · ${esc(o.email)} · ${esc(o.contact)}</p><table><tbody><tr><th>Payment</th><td><span class="status ${esc(o.paymentStatus)}">${esc(o.paymentStatus)}</span></td></tr><tr><th>Delivery</th><td><span class="status ${esc(o.deliveryStatus)}">${esc(o.deliveryStatus)}</span></td></tr><tr><th>Amount</th><td>$${esc(o.amountUsd)}</td></tr><tr><th>Tracking token</th><td><span class="code">${esc(o.trackingToken)}</span></td></tr></tbody></table><form method="post" action="/admin/update"><input type="hidden" name="orderNo" value="${esc(o.orderNo)}"><label>Payment status<select name="paymentStatus"><option${o.paymentStatus==='pending'?' selected':''}>pending</option><option${o.paymentStatus==='paid'?' selected':''}>paid</option><option${o.paymentStatus==='failed'?' selected':''}>failed</option><option${o.paymentStatus==='cancelled'?' selected':''}>cancelled</option></select></label><label>Delivery status<select name="deliveryStatus"><option${o.deliveryStatus==='new'?' selected':''}>new</option><option${o.deliveryStatus==='processing'?' selected':''}>processing</option><option${o.deliveryStatus==='delivered'?' selected':''}>delivered</option></select></label><label>Note<textarea name="note">${esc(o.note || '')}</textarea></label><button class="primary" type="submit">Save order</button></form></div><div><h3>Messages</h3><div class="messages">${msgs.map(m=>`<div class="msg ${m.sender==='admin'?'admin':''}"><strong>${esc(m.sender)}</strong><p>${esc(m.content)}</p><div class="muted">${new Date(m.createdAt).toLocaleString()}</div></div>`).join('')}</div><form method="post" action="/admin/reply"><input type="hidden" name="orderNo" value="${esc(o.orderNo)}"><label>Reply<textarea name="content" required></textarea></label><button class="secondary" type="submit">Send reply</button></form></div></div></div>`}).join('')}</section>`);
}

const server = http.createServer(async (req, res) => {
  const db = readDb();
  const url = new URL(req.url, SITE_URL);
  const cookies = getCookies(req);
  const authed = cookies.admin_key === ADMIN_KEY;

  if (req.method === 'GET' && url.pathname === '/') return send(res, 200, homePage(db), { 'Content-Type': 'text/html; charset=utf-8' });
  if (req.method === 'GET' && url.pathname === '/checkout') return send(res, 200, checkoutPage(), { 'Content-Type': 'text/html; charset=utf-8' });
  if (req.method === 'POST' && url.pathname === '/checkout') {
    const body = await parseBody(req);
    const order = createOrder(db, body);
    return redirect(res, `/track?orderNo=${encodeURIComponent(order.orderNo)}&email=${encodeURIComponent(order.email)}`);
  }
  if (req.method === 'GET' && url.pathname === '/track') {
    const query = Object.fromEntries(url.searchParams.entries());
    if (!query.orderNo || !query.email) return send(res, 200, trackPage(query, db), { 'Content-Type': 'text/html; charset=utf-8' });
    const order = getOrder(db, query.orderNo, query.email);
    return send(res, 200, trackPage(query, db, order, order ? '' : 'Order not found'), { 'Content-Type': 'text/html; charset=utf-8' });
  }
  if (req.method === 'POST' && url.pathname === '/message') {
    const body = await parseBody(req);
    db.messages.push({ id: crypto.randomUUID(), orderNo: body.orderNo, sender: 'customer', content: body.content, createdAt: new Date().toISOString() });
    writeDb(db);
    return redirect(res, `/track?orderNo=${encodeURIComponent(body.orderNo)}&email=${encodeURIComponent(body.email)}`);
  }
  if (req.method === 'GET' && url.pathname === '/admin') return send(res, 200, adminPage(db, authed), { 'Content-Type': 'text/html; charset=utf-8' });
  if (req.method === 'POST' && url.pathname === '/admin/login') {
    const body = await parseBody(req);
    if (body.adminKey !== ADMIN_KEY) return send(res, 401, layout('Admin', '<div class="section"><div class="card"><h1>Wrong admin key</h1><p><a href="/admin">Try again</a></p></div></div>'), { 'Content-Type': 'text/html; charset=utf-8' });
    return redirect(res, '/admin', { 'Set-Cookie': `admin_key=${encodeURIComponent(ADMIN_KEY)}; HttpOnly; Path=/; SameSite=Lax` });
  }
  if (req.method === 'POST' && url.pathname === '/admin/update') {
    if (!authed) return send(res, 403, 'Forbidden');
    const body = await parseBody(req);
    const order = getOrder(db, body.orderNo);
    if (order) Object.assign(order, { paymentStatus: body.paymentStatus, deliveryStatus: body.deliveryStatus, note: body.note });
    writeDb(db); return redirect(res, '/admin');
  }
  if (req.method === 'POST' && url.pathname === '/admin/reply') {
    if (!authed) return send(res, 403, 'Forbidden');
    const body = await parseBody(req);
    db.messages.push({ id: crypto.randomUUID(), orderNo: body.orderNo, sender: 'admin', content: body.content, createdAt: new Date().toISOString() });
    writeDb(db); return redirect(res, '/admin');
  }
  if (req.method === 'POST' && url.pathname === '/api/webhooks/payment') {
    const body = await parseBody(req);
    const order = getOrder(db, body.orderNo);
    if (!order) return json(res, { error: 'Order not found' }, 404);
    Object.assign(order, { paymentStatus: body.paymentStatus || 'paid', deliveryStatus: body.deliveryStatus || 'processing', note: body.note || 'Payment confirmed. Processing order.' });
    writeDb(db); return json(res, { ok: true, order });
  }
  if (req.method === 'GET' && url.pathname === '/api/order') {
    const order = getOrder(db, url.searchParams.get('orderNo'), url.searchParams.get('email'));
    if (!order) return json(res, { error: 'Order not found' }, 404);
    return json(res, { order, messages: getMessages(db, order.orderNo) });
  }
  json(res, { error: 'Not found' }, 404);
});

server.listen(PORT, () => {
  ensureDb();
  console.log(`MVP running at ${SITE_URL}`);
});
