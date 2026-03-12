// file: lib/supabase.js
const { getEnv } = require('./utils');

function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL', { required: true });
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', { required: true });
  return { url, serviceKey };
}

async function supabaseRequest(path, options) {
  const { url, serviceKey } = getSupabaseConfig();
  const fullUrl = url.replace(/\/+$/, '') + path;

  const headers = Object.assign(
    {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    options.headers || {}
  );

  const res = await fetch(fullUrl, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const detail = data || text || null;
    const err = new Error(`Supabase request failed (${res.status})`);
    err.status = res.status;
    err.body = detail;
    throw err;
  }

  return data;
}

async function insertOrder(order) {
  const body = JSON.stringify(order);
  const data = await supabaseRequest('/rest/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body,
  });
  return Array.isArray(data) ? data[0] : data;
}

async function updateOrderByOrderId(orderId, patch) {
  const body = JSON.stringify(patch);
  const data = await supabaseRequest(`/rest/v1/orders?order_id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body,
  });
  return Array.isArray(data) ? data[0] : data;
}

async function getOrderByOrderId(orderId) {
  const data = await supabaseRequest(
    `/rest/v1/orders?order_id=eq.${encodeURIComponent(orderId)}&limit=1`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return null;
}

async function getLastCompletedOrder(email) {
  const data = await supabaseRequest(
    `/rest/v1/orders?email=eq.${encodeURIComponent(email)}&is_delivered=eq.true&order=created_at.desc&limit=1`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return null;
}

async function listRecentOrders(limit = 50) {
  const data = await supabaseRequest(
    `/rest/v1/orders?select=*&order=created_at.desc&limit=${Number(limit) || 50}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  return Array.isArray(data) ? data : [];
}

async function insertSupportMessage(message) {
  const body = JSON.stringify(message);
  const data = await supabaseRequest('/rest/v1/support_messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body,
  });
  return Array.isArray(data) ? data[0] : data;
}

async function getSupportMessagesByOrderId(orderId) {
  const data = await supabaseRequest(
    `/rest/v1/support_messages?order_id=eq.${encodeURIComponent(orderId)}&order=created_at.asc`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  return Array.isArray(data) ? data : [];
}

module.exports = {
  insertOrder,
  updateOrderByOrderId,
  getOrderByOrderId,
  getLastCompletedOrder,
  listRecentOrders,
  insertSupportMessage,
  getSupportMessagesByOrderId,
};





