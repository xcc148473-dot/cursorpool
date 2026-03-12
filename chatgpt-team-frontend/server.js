const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3200;
const BACKEND_BASE = process.env.BACKEND_BASE || 'http://127.0.0.1:3100';
const SITE_NAME = process.env.SITE_NAME || 'ChatGPT Team';

function send(res, code, body, headers = {}) { res.writeHead(code, headers); res.end(body); }
function html(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title><style>
  body{margin:0;background:#08101f;color:#eef2ff;font-family:Inter,Arial,sans-serif}a{text-decoration:none;color:inherit}.container{width:min(1120px,calc(100% - 32px));margin:0 auto}.header{display:flex;justify-content:space-between;align-items:center;padding:20px 0}.header nav{display:flex;gap:18px}.card{background:#111a31;border:1px solid #273457;border-radius:18px;padding:22px}.grid{display:grid;gap:20px}.two{grid-template-columns:1.2fr .8fr}.section{padding:18px 0}.btn,button{border:0;border-radius:12px;padding:12px 16px;font-weight:700;cursor:pointer}.primary{background:#6ea8fe;color:#081224}.secondary{background:transparent;border:1px solid #2b365d;color:#eef2ff}.price{font-size:56px;font-weight:800}.muted,p,li,label,td,th{color:#a6b6dd}.badge{display:inline-block;padding:8px 12px;border-radius:999px;background:#142544;color:#6ea8fe;border:1px solid #284474;font-size:14px}.table{width:100%;border-collapse:collapse}td,th{padding:10px 8px;border-bottom:1px solid #2b365d;text-align:left;vertical-align:top}input,textarea{width:100%;padding:12px 14px;border-radius:12px;border:1px solid #2b365d;background:#0d1327;color:#eef2ff;margin-top:8px}textarea{min-height:110px}.status{display:inline-block;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:700}.pending_payment,.pending{background:#3c3314;color:#ffd166}.processing{background:#173046;color:#7dc7ff}.completed,.delivered{background:#17352c;color:#8bf0c6}.messages{display:grid;gap:12px;margin-top:16px}.msg{padding:14px;border-radius:14px;border:1px solid #2b365d;background:#0d1327}.admin{border-color:#6ea8fe}.small{font-size:13px;color:#a6b6dd}.split{display:flex;gap:12px;flex-wrap:wrap}.code{font-family:monospace;background:#1c2543;padding:2px 8px;border-radius:999px}@media(max-width:900px){.two{grid-template-columns:1fr}}</style></head><body><main class="container">${body}</main></body></html>`;
}
async function parseBody(req) { let raw=''; for await (const c of req) raw += c; return raw ? Object.fromEntries(new URLSearchParams(raw)) : {}; }
async function api(path, options = {}) {
  const res = await fetch(`${BACKEND_BASE.replace(/\/$/, '')}${path}`, options);
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

function homePage() {
  return html(SITE_NAME, `<div class="header"><div class="badge">${SITE_NAME}</div><nav><a href="/track">Track order</a><a href="/admin">Admin</a></nav></div>
  <section class="section grid two"><div class="card"><div class="badge">$10 offer</div><h1>ChatGPT Business Team Shared Seat</h1><p>Shared seat in a ChatGPT Business team workspace. You use your own email/account, and we add you to the active workspace after payment.</p><div class="price">$10</div><div class="split"><a class="btn primary" href="/checkout">Buy now</a><a class="btn secondary" href="/track">Track order</a></div><ul><li>Use your own email/account</li><li>Pay first, then we process the seat</li><li>Track order status and message support anytime</li></ul></div>
  <div class="card"><h2>What you get</h2><p>This site is the customer-facing frontend only. Payment is handled by a separate backend, while support and admin flows are handled by the business backend.</p><table class="table"><tbody><tr><th>Product</th><td>ChatGPT Business Team Shared Seat</td></tr><tr><th>Price</th><td>$10 USD</td></tr><tr><th>Plan id</th><td><span class="code">gpt_team_30d</span></td></tr><tr><th>Payment method</th><td>fiat</td></tr></tbody></table></div></section>`);
}
function checkoutPage(error='') {
  return html('Checkout', `<div class="header"><a href="/">← Home</a></div><section class="section"><div class="card" style="max-width:760px;margin:0 auto"><h1>Checkout</h1><p>Fill in your email and contact handle. We will create your order and send you to the payment page.</p><form method="post" action="/checkout"><label>Name<input name="customerName" /></label><label>Email<input type="email" name="email" required></label><label>Contact handle<input name="contact" placeholder="Telegram / WhatsApp / Discord / X" required></label><button class="primary" type="submit">Continue to payment</button></form>${error?`<p style="color:#ff8585">${error}</p>`:''}</div></section>`);
}
function trackPage({order=null,error='',query={}}={}) {
  return html('Track order', `<div class="header"><a href="/">← Home</a></div><section class="section grid two"><div class="card"><h1>Track your order</h1><form method="get" action="/track"><label>Order ID<input name="order_id" value="${query.order_id||''}" required></label><label>Email<input type="email" name="email" value="${query.email||''}" required></label><button class="primary" type="submit">Check status</button></form>${error?`<p style="color:#ff8585">${error}</p>`:''}</div><div class="card"><h2>Support</h2><p>After payment, use your order ID and email to check payment status and talk to support.</p></div></section>
  ${order?`<section class="section grid two"><div class="card"><h2>Order status</h2><table class="table"><tbody><tr><th>Order ID</th><td>${order.orderId}</td></tr><tr><th>Email</th><td>${order.email}</td></tr><tr><th>Contact</th><td>${order.contact||'-'}</td></tr><tr><th>Status</th><td><span class="status ${order.status}">${order.status}</span></td></tr><tr><th>Fulfillment</th><td><span class="status ${order.fulfillmentStatus}">${order.fulfillmentStatus}</span></td></tr><tr><th>Delivery</th><td>${order.deliveryMessage||'-'}</td></tr></tbody></table></div>
  <div class="card"><h2>Messages</h2><form method="post" action="/support"><input type="hidden" name="order_id" value="${order.orderId}"><input type="hidden" name="email" value="${order.email}"><label>Your message<textarea name="message" required></textarea></label><button class="primary" type="submit">Send message</button></form><div class="messages">${(order.messages||[]).map(m=>`<div class="msg ${m.sender==='admin'?'admin':''}"><strong>${m.sender==='admin'?'Support':'You'}</strong><p>${m.message}</p><div class="small">${new Date(m.createdAt).toLocaleString()}</div></div>`).join('')}</div></div></section>`:''}`);
}
function adminLogin(error='') { return html('Admin', `<div class="header"><a href="/">← Home</a></div><section class="section"><div class="card" style="max-width:520px;margin:0 auto"><h1>Admin login</h1><form method="post" action="/admin/login"><label>Admin secret<input name="adminSecret" type="password" required></label><button class="primary" type="submit">Login</button></form>${error?`<p style="color:#ff8585">${error}</p>`:''}</div></section>`); }
function adminPage(orders) {
  return html('Admin', `<div class="header"><div class="badge">Admin</div><nav><a href="/">Home</a></nav></div><section class="section">${orders.map(o=>`<div class="card" style="margin-bottom:18px"><div class="grid two"><div><h2>${o.orderId}</h2><table class="table"><tbody><tr><th>Email</th><td>${o.email}</td></tr><tr><th>Contact</th><td>${o.contact||'-'}</td></tr><tr><th>Status</th><td><span class="status ${o.status}">${o.status}</span></td></tr><tr><th>Fulfillment</th><td><span class="status ${o.fulfillmentStatus}">${o.fulfillmentStatus}</span></td></tr><tr><th>Payment URL</th><td class="small">${o.paymentUrl||'-'}</td></tr></tbody></table><form method="post" action="/admin/mark-delivered"><input type="hidden" name="order_id" value="${o.orderId}"><label>Delivery message<textarea name="delivery_message">${o.deliveryMessage||'Your account has been added to the ChatGPT Business team workspace.'}</textarea></label><button class="primary" type="submit">Mark delivered</button></form></div><div><h3>Messages</h3><div class="messages">${(o.messages||[]).map(m=>`<div class="msg ${m.sender==='admin'?'admin':''}"><strong>${m.sender}</strong><p>${m.message}</p><div class="small">${new Date(m.createdAt).toLocaleString()}</div></div>`).join('')}</div><form method="post" action="/admin/reply"><input type="hidden" name="order_id" value="${o.orderId}"><label>Reply<textarea name="message" required></textarea></label><button class="secondary" type="submit">Send reply</button></form></div></div></div>`).join('')}</section>`);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(v => v.trim()).filter(Boolean).map(v => { const i=v.indexOf('='); return [v.slice(0,i), decodeURIComponent(v.slice(i+1))]; }));

  if (req.method === 'GET' && url.pathname === '/') return send(res, 200, homePage(), { 'Content-Type': 'text/html; charset=utf-8' });
  if (req.method === 'GET' && url.pathname === '/checkout') return send(res, 200, checkoutPage(), { 'Content-Type': 'text/html; charset=utf-8' });
  if (req.method === 'POST' && url.pathname === '/checkout') {
    const body = await parseBody(req);
    const result = await api('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!result.ok) return send(res, 200, checkoutPage(result.data.message || result.data.error || 'Checkout failed'), { 'Content-Type': 'text/html; charset=utf-8' });
    return send(res, 302, '', { Location: result.data.payment.payment_url || `/track?order_id=${encodeURIComponent(result.data.order.orderId)}&email=${encodeURIComponent(result.data.order.email)}` });
  }
  if (req.method === 'GET' && url.pathname === '/track') {
    const orderId = url.searchParams.get('order_id');
    const email = url.searchParams.get('email');
    if (!orderId || !email) return send(res, 200, trackPage({ query: { order_id: orderId || '', email: email || '' } }), { 'Content-Type': 'text/html; charset=utf-8' });
    const result = await api(`/api/orders/status?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
    if (!result.ok) return send(res, 200, trackPage({ error: result.data.message || result.data.error || 'Lookup failed', query: { order_id: orderId, email } }), { 'Content-Type': 'text/html; charset=utf-8' });
    return send(res, 200, trackPage({ order: result.data.order, query: { order_id: orderId, email } }), { 'Content-Type': 'text/html; charset=utf-8' });
  }
  if (req.method === 'POST' && url.pathname === '/support') {
    const body = await parseBody(req);
    await api('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return send(res, 302, '', { Location: `/track?order_id=${encodeURIComponent(body.order_id)}&email=${encodeURIComponent(body.email)}` });
  }
  if (req.method === 'GET' && url.pathname === '/admin') {
    if (!cookies.admin_secret) return send(res, 200, adminLogin(), { 'Content-Type': 'text/html; charset=utf-8' });
    const result = await api('/api/admin/orders', { headers: { 'x-admin-secret': cookies.admin_secret } });
    if (!result.ok) return send(res, 200, adminLogin('Unauthorized'), { 'Content-Type': 'text/html; charset=utf-8' });
    return send(res, 200, adminPage(result.data.orders || []), { 'Content-Type': 'text/html; charset=utf-8' });
  }
  if (req.method === 'POST' && url.pathname === '/admin/login') {
    const body = await parseBody(req);
    const result = await api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!result.ok) return send(res, 200, adminLogin('Wrong admin secret'), { 'Content-Type': 'text/html; charset=utf-8' });
    return send(res, 302, '', { 'Set-Cookie': `admin_secret=${encodeURIComponent(body.adminSecret)}; HttpOnly; Path=/; SameSite=Lax`, Location: '/admin' });
  }
  if (req.method === 'POST' && url.pathname === '/admin/reply') {
    const body = await parseBody(req);
    await api('/api/admin/support-reply', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': cookies.admin_secret || '' }, body: JSON.stringify(body) });
    return send(res, 302, '', { Location: '/admin' });
  }
  if (req.method === 'POST' && url.pathname === '/admin/mark-delivered') {
    const body = await parseBody(req);
    await api('/api/admin/mark-delivered', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': cookies.admin_secret || '' }, body: JSON.stringify(body) });
    return send(res, 302, '', { Location: '/admin' });
  }
  send(res, 404, 'Not Found');
});

server.listen(PORT, () => console.log(`chatgpt-team-frontend running on http://127.0.0.1:${PORT}`));
