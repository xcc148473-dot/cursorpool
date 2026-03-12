const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3200;
const BACKEND_BASE = process.env.BACKEND_BASE || 'http://127.0.0.1:3100';
const SITE_NAME = process.env.SITE_NAME || 'ChatGPT Team';

function send(res, code, body, headers = {}) { res.writeHead(code, headers); res.end(body); }

function html(title, body) {
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      :root {
        --bg: #08101f;
        --panel: #0f172d;
        --panel-2: #111b36;
        --line: #243257;
        --line-soft: #1b2746;
        --text: #eef2ff;
        --muted: #9eb1d8;
        --blue: #79aefc;
        --blue-2: #b7d1ff;
        --green: #91efc2;
        --yellow: #ffd166;
        --red: #ff8f9b;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: radial-gradient(circle at top, #122244 0%, var(--bg) 38%); color: var(--text); font-family: Inter, Arial, sans-serif; }
      a { text-decoration: none; color: inherit; }
      .container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: center; padding: 22px 0; gap: 16px; }
      .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: .2px; }
      .brand-dot { width: 12px; height: 12px; border-radius: 999px; background: linear-gradient(135deg, var(--blue), #9c7bff); box-shadow: 0 0 24px rgba(121,174,252,.55); }
      .nav { display: flex; gap: 18px; flex-wrap: wrap; }
      .nav a { color: var(--muted); }
      .nav a:hover { color: var(--text); }
      .hero { display: grid; grid-template-columns: 1.2fr .8fr; gap: 22px; padding: 18px 0 8px; }
      .card { background: linear-gradient(180deg, rgba(19,29,57,.96), rgba(11,18,35,.96)); border: 1px solid var(--line); border-radius: 22px; padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,.28); }
      .hero-main { padding: 34px 28px; }
      .badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(121,174,252,.3); background: rgba(121,174,252,.12); color: var(--blue); font-size: 14px; }
      h1, h2, h3 { margin: 0 0 12px; line-height: 1.08; }
      h1 { font-size: clamp(36px, 5vw, 60px); }
      h2 { font-size: 28px; }
      h3 { font-size: 18px; }
      p, li, label, td, th { color: var(--muted); line-height: 1.65; }
      .lead { font-size: 18px; max-width: 760px; }
      .price { font-size: 62px; font-weight: 900; margin: 10px 0 4px; color: var(--text); }
      .price small { font-size: 20px; color: var(--muted); font-weight: 600; }
      .button-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
      .btn, button { border: 0; border-radius: 14px; padding: 13px 18px; font-weight: 800; cursor: pointer; font-size: 15px; }
      .btn.primary, button.primary { background: linear-gradient(180deg, #8cb8ff, #6ea8fe); color: #081224; }
      .btn.secondary, button.secondary { background: transparent; border: 1px solid var(--line); color: var(--text); }
      .section { padding: 18px 0; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .feature { padding: 18px; border-radius: 18px; border: 1px solid var(--line-soft); background: rgba(255,255,255,.02); }
      .feature strong { display: block; margin-bottom: 8px; }
      .table { width: 100%; border-collapse: collapse; }
      .table td, .table th { text-align: left; padding: 12px 8px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
      .table th { width: 150px; color: var(--blue-2); font-weight: 700; }
      .fine { font-size: 13px; color: #8394ba; }
      .code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; background: rgba(255,255,255,.05); padding: 3px 9px; border-radius: 999px; }
      .faq { display: grid; gap: 12px; }
      .faq .item { border: 1px solid var(--line-soft); border-radius: 16px; padding: 16px; background: rgba(255,255,255,.02); }
      .form-card { max-width: 820px; margin: 8px auto 28px; }
      input, textarea { width: 100%; padding: 13px 14px; border-radius: 14px; border: 1px solid var(--line); background: #0a1328; color: var(--text); margin-top: 8px; outline: none; }
      textarea { min-height: 115px; resize: vertical; }
      .form-grid { display: grid; gap: 16px; }
      .status { display: inline-flex; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; }
      .pending_payment, .pending { background: rgba(255,209,102,.14); color: var(--yellow); }
      .processing { background: rgba(121,174,252,.15); color: var(--blue); }
      .completed, .delivered { background: rgba(145,239,194,.14); color: var(--green); }
      .messages { display: grid; gap: 12px; margin-top: 18px; }
      .msg { padding: 14px; border-radius: 16px; border: 1px solid var(--line-soft); background: rgba(255,255,255,.025); }
      .msg.admin { border-color: rgba(121,174,252,.35); }
      .small { font-size: 13px; color: var(--muted); }
      .notice { border: 1px solid rgba(121,174,252,.22); background: rgba(121,174,252,.08); color: var(--blue-2); padding: 14px 16px; border-radius: 16px; }
      .danger { color: var(--red); }
      .footer { padding: 28px 0 42px; color: #8394ba; font-size: 13px; }
      @media (max-width: 920px) {
        .hero, .grid-3, .grid-2 { grid-template-columns: 1fr; }
        .hero-main { padding: 24px; }
        .price { font-size: 48px; }
        .header { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <main class="container">${body}<div class="footer">${SITE_NAME} · shared-seat storefront · order tracking and support</div></main>
  </body>
  </html>`;
}

async function parseBody(req) {
  let raw = '';
  for await (const c of req) raw += c;
  return raw ? Object.fromEntries(new URLSearchParams(raw)) : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${BACKEND_BASE.replace(/\/$/, '')}${path}`, options);
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

function header() {
  return `<div class="header"><div class="brand"><span class="brand-dot"></span><span>${SITE_NAME}</span></div><div class="nav"><a href="/">Home</a><a href="/checkout">Checkout</a><a href="/track">Track order</a><a href="/admin">Admin</a></div></div>`;
}

function homePage() {
  return html(SITE_NAME, `${header()}
    <section class="hero">
      <div class="card hero-main">
        <div class="badge">$10 launch offer</div>
        <h1>ChatGPT Business Team Shared Seat</h1>
        <p class="lead">Use your own email/account. After payment, your order is processed and your account is added to the active ChatGPT Business team workspace.</p>
        <div class="price">$10 <small>/ order</small></div>
        <p>No account creation on this site is required. You pay, get an order ID, track progress, and message support from the order page.</p>
        <div class="button-row">
          <a class="btn primary" href="/checkout">Buy now</a>
          <a class="btn secondary" href="/track">Track existing order</a>
        </div>
      </div>
      <div class="card">
        <h2>What you get</h2>
        <table class="table">
          <tbody>
            <tr><th>Product</th><td>ChatGPT Business Team Shared Seat</td></tr>
            <tr><th>Price</th><td>$10 USD</td></tr>
            <tr><th>Plan</th><td><span class="code">gpt_team_30d</span></td></tr>
            <tr><th>Payment</th><td>Fiat checkout via shared payment backend</td></tr>
            <tr><th>Delivery</th><td>Order status page + support messages + admin processing</td></tr>
          </tbody>
        </table>
        <p class="fine">This storefront is the frontend. Payment and business order logic are handled by separate backends.</p>
      </div>
    </section>

    <section class="section grid-3">
      <div class="feature"><strong>1. Fast checkout</strong><p>Enter your email and contact handle, then continue to payment.</p></div>
      <div class="feature"><strong>2. Clear order tracking</strong><p>Use your order ID + email to check payment and fulfillment status at any time.</p></div>
      <div class="feature"><strong>3. Message support</strong><p>If anything is unclear, message support directly from your order page.</p></div>
    </section>

    <section class="section grid-2">
      <div class="card">
        <h2>How it works</h2>
        <div class="faq">
          <div class="item"><strong>Step 1</strong><p>Submit your email and contact handle from the checkout page.</p></div>
          <div class="item"><strong>Step 2</strong><p>You will be redirected to the payment page generated by the payment backend.</p></div>
          <div class="item"><strong>Step 3</strong><p>After payment, your order moves to processing. You can check the order page anytime.</p></div>
          <div class="item"><strong>Step 4</strong><p>When the order is completed, the order page will show the delivery message.</p></div>
        </div>
      </div>
      <div class="card">
        <h2>FAQ</h2>
        <div class="faq">
          <div class="item"><strong>Do I need to create an account here?</strong><p>No. This site uses order lookup instead of account registration.</p></div>
          <div class="item"><strong>How do I track my order?</strong><p>Go to the track page and enter your order ID and email.</p></div>
          <div class="item"><strong>How do I contact support?</strong><p>Open your order page and send a message there. Support replies in the same thread.</p></div>
          <div class="item"><strong>What do I receive when completed?</strong><p>You receive a delivery message confirming the order result.</p></div>
        </div>
      </div>
    </section>`);
}

function checkoutPage(error = '') {
  return html('Checkout', `${header()}
    <section class="section">
      <div class="card form-card">
        <div class="badge">Checkout</div>
        <h1>Place your order</h1>
        <p>Fill in your details below. We will create your order and redirect you to the payment page.</p>
        <div class="notice">Product: <strong>ChatGPT Business Team Shared Seat</strong> · Price: <strong>$10</strong></div>
        <form method="post" action="/checkout" class="form-grid" style="margin-top:18px;">
          <label>Name (optional)
            <input name="customerName" placeholder="Your display name">
          </label>
          <label>Email
            <input type="email" name="email" required placeholder="you@example.com">
          </label>
          <label>Contact handle
            <input name="contact" placeholder="Telegram / WhatsApp / Discord / X" required>
          </label>
          <div class="button-row">
            <button class="primary" type="submit">Continue to payment</button>
            <a class="btn secondary" href="/track">Already ordered? Track it</a>
          </div>
        </form>
        ${error ? `<p class="danger">${error}</p>` : ''}
      </div>
    </section>`);
}

function trackPage({ order = null, error = '', query = {} } = {}) {
  const statusTip = order ? (order.status === 'completed' ? 'Your order is completed.' : order.status === 'processing' ? 'Payment confirmed. Order is being processed.' : 'Waiting for payment confirmation.') : 'Use your order ID and email to look up your order.';
  return html('Track order', `${header()}
    <section class="section grid-2">
      <div class="card">
        <div class="badge">Track order</div>
        <h1>Order status</h1>
        <p>${statusTip}</p>
        <form method="get" action="/track" class="form-grid">
          <label>Order ID
            <input name="order_id" value="${query.order_id || ''}" required placeholder="order_xxx">
          </label>
          <label>Email
            <input type="email" name="email" value="${query.email || ''}" required placeholder="you@example.com">
          </label>
          <div class="button-row">
            <button class="primary" type="submit">Check status</button>
            <a class="btn secondary" href="/checkout">New order</a>
          </div>
        </form>
        ${error ? `<p class="danger">${error}</p>` : ''}
      </div>
      <div class="card">
        <h2>What you can do here</h2>
        <ul>
          <li>Check payment status</li>
          <li>See fulfillment progress</li>
          <li>Read the delivery message after completion</li>
          <li>Contact support from the same order thread</li>
        </ul>
      </div>
    </section>

    ${order ? `
    <section class="section grid-2">
      <div class="card">
        <h2>Order details</h2>
        <table class="table">
          <tbody>
            <tr><th>Order ID</th><td>${order.orderId}</td></tr>
            <tr><th>Email</th><td>${order.email}</td></tr>
            <tr><th>Contact</th><td>${order.contact || '-'}</td></tr>
            <tr><th>Status</th><td><span class="status ${order.status}">${order.status}</span></td></tr>
            <tr><th>Fulfillment</th><td><span class="status ${order.fulfillmentStatus}">${order.fulfillmentStatus}</span></td></tr>
            <tr><th>Delivery message</th><td>${order.deliveryMessage || '-'}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2>Contact support</h2>
        <form method="post" action="/support" class="form-grid">
          <input type="hidden" name="order_id" value="${order.orderId}">
          <input type="hidden" name="email" value="${order.email}">
          <label>Your message
            <textarea name="message" required placeholder="Ask about payment, fulfillment, or delivery."></textarea>
          </label>
          <div class="button-row">
            <button class="primary" type="submit">Send message</button>
          </div>
        </form>
        <div class="messages">
          ${(order.messages || []).length ? (order.messages || []).map(m => `<div class="msg ${m.sender === 'admin' ? 'admin' : ''}"><strong>${m.sender === 'admin' ? 'Support' : 'You'}</strong><p>${m.message}</p><div class="small">${new Date(m.createdAt).toLocaleString()}</div></div>`).join('') : `<div class="notice">No messages yet. You can send one above.</div>`}
        </div>
      </div>
    </section>` : ''}`);
}

function adminLogin(error = '') {
  return html('Admin', `${header()}
    <section class="section">
      <div class="card form-card" style="max-width:540px;">
        <div class="badge">Admin</div>
        <h1>Admin login</h1>
        <p>Use the admin secret configured in the backend environment variables.</p>
        <form method="post" action="/admin/login" class="form-grid">
          <label>Admin secret
            <input name="adminSecret" type="password" required>
          </label>
          <button class="primary" type="submit">Login</button>
        </form>
        ${error ? `<p class="danger">${error}</p>` : ''}
      </div>
    </section>`);
}

function adminPage(orders) {
  return html('Admin dashboard', `${header()}
    <section class="section">
      <div class="card"><h1>Admin dashboard</h1><p>Manage orders, delivery messages, and support replies.</p></div>
    </section>
    <section class="section">
      ${orders.length ? orders.map(o => `
      <div class="card" style="margin-bottom:18px;">
        <div class="grid-2">
          <div>
            <h2>${o.orderId}</h2>
            <table class="table">
              <tbody>
                <tr><th>Email</th><td>${o.email}</td></tr>
                <tr><th>Contact</th><td>${o.contact || '-'}</td></tr>
                <tr><th>Status</th><td><span class="status ${o.status}">${o.status}</span></td></tr>
                <tr><th>Fulfillment</th><td><span class="status ${o.fulfillmentStatus}">${o.fulfillmentStatus}</span></td></tr>
                <tr><th>Payment URL</th><td class="small">${o.paymentUrl || '-'}</td></tr>
              </tbody>
            </table>
            <form method="post" action="/admin/mark-delivered" class="form-grid">
              <input type="hidden" name="order_id" value="${o.orderId}">
              <label>Delivery message
                <textarea name="delivery_message">${o.deliveryMessage || 'Your account has been added to the ChatGPT Business team workspace.'}</textarea>
              </label>
              <button class="primary" type="submit">Mark delivered</button>
            </form>
          </div>
          <div>
            <h3>Messages</h3>
            <div class="messages">
              ${(o.messages || []).length ? (o.messages || []).map(m => `<div class="msg ${m.sender === 'admin' ? 'admin' : ''}"><strong>${m.sender}</strong><p>${m.message}</p><div class="small">${new Date(m.createdAt).toLocaleString()}</div></div>`).join('') : `<div class="notice">No messages for this order yet.</div>`}
            </div>
            <form method="post" action="/admin/reply" class="form-grid" style="margin-top:16px;">
              <input type="hidden" name="order_id" value="${o.orderId}">
              <label>Reply
                <textarea name="message" required placeholder="Write a reply to the customer."></textarea>
              </label>
              <button class="secondary" type="submit">Send reply</button>
            </form>
          </div>
        </div>
      </div>`).join('') : `<div class="card"><p>No orders yet.</p></div>`}
    </section>`);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map(v => v.trim()).filter(Boolean).map(v => { const i = v.indexOf('='); return [v.slice(0, i), decodeURIComponent(v.slice(i + 1))]; }));

  if (req.method === 'GET' && url.pathname === '/') return send(res, 200, homePage(), { 'Content-Type': 'text/html; charset=utf-8' });

  if (req.method === 'GET' && url.pathname === '/checkout') return send(res, 200, checkoutPage(), { 'Content-Type': 'text/html; charset=utf-8' });

  if (req.method === 'POST' && url.pathname === '/checkout') {
    const body = await parseBody(req);
    const result = await api('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
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
    await api('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
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
    const result = await api('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!result.ok) return send(res, 200, adminLogin('Wrong admin secret'), { 'Content-Type': 'text/html; charset=utf-8' });
    return send(res, 302, '', { 'Set-Cookie': `admin_secret=${encodeURIComponent(body.adminSecret)}; HttpOnly; Path=/; SameSite=Lax`, Location: '/admin' });
  }

  if (req.method === 'POST' && url.pathname === '/admin/reply') {
    const body = await parseBody(req);
    await api('/api/admin/support-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': cookies.admin_secret || '' },
      body: JSON.stringify(body)
    });
    return send(res, 302, '', { Location: '/admin' });
  }

  if (req.method === 'POST' && url.pathname === '/admin/mark-delivered') {
    const body = await parseBody(req);
    await api('/api/admin/mark-delivered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': cookies.admin_secret || '' },
      body: JSON.stringify(body)
    });
    return send(res, 302, '', { Location: '/admin' });
  }

  send(res, 404, 'Not Found');
});

server.listen(PORT, () => console.log(`chatgpt-team-frontend running on http://127.0.0.1:${PORT}`));
