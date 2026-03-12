const { URL } = require('url');

function getEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getConfig() {
  return {
    url: getEnv('SUPABASE_URL').replace(/\/$/, ''),
    key: getEnv('SUPABASE_SERVICE_ROLE_KEY')
  };
}

async function request(path, options = {}) {
  const { url, key } = getConfig();
  const res = await fetch(`${url}${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.headers || {})
    },
    body: options.body
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`Supabase request failed (${res.status})`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

async function listProducts() {
  const data = await request('/rest/v1/team_products?select=*&order=created_at.asc', { headers: { Accept: 'application/json' } });
  return Array.isArray(data) ? data : [];
}

async function getProductById(id) {
  const data = await request(`/rest/v1/team_products?id=eq.${encodeURIComponent(id)}&limit=1`, { headers: { Accept: 'application/json' } });
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function insertBusinessOrder(order) {
  const data = await request('/rest/v1/team_orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(order)
  });
  return Array.isArray(data) ? data[0] : data;
}

async function updateBusinessOrderByOrderId(orderId, patch) {
  const data = await request(`/rest/v1/team_orders?order_id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(patch)
  });
  return Array.isArray(data) ? data[0] : data;
}

async function getBusinessOrderByOrderId(orderId) {
  const data = await request(`/rest/v1/team_orders?order_id=eq.${encodeURIComponent(orderId)}&limit=1`, { headers: { Accept: 'application/json' } });
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function listBusinessOrders(limit = 100) {
  const data = await request(`/rest/v1/team_orders?select=*&order=created_at.desc&limit=${Number(limit) || 100}`, { headers: { Accept: 'application/json' } });
  return Array.isArray(data) ? data : [];
}

async function insertMessage(message) {
  const data = await request('/rest/v1/team_messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(message)
  });
  return Array.isArray(data) ? data[0] : data;
}

async function listMessagesByOrderId(orderId) {
  const data = await request(`/rest/v1/team_messages?order_id=eq.${encodeURIComponent(orderId)}&order=created_at.asc`, { headers: { Accept: 'application/json' } });
  return Array.isArray(data) ? data : [];
}

module.exports = {
  listProducts,
  getProductById,
  insertBusinessOrder,
  updateBusinessOrderByOrderId,
  getBusinessOrderByOrderId,
  listBusinessOrders,
  insertMessage,
  listMessagesByOrderId,
};
