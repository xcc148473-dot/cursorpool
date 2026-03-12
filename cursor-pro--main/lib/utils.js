// file: lib/utils.js
const crypto = require('crypto');

function getEnv(name, options = {}) {
  const value = process.env[name];
  if ((options.required && !value) || (options.required && value === '')) {
    const err = new Error(`Missing required environment variable: ${name}`);
    err.code = 'ENV_MISSING';
    err.envName = name;
    throw err;
  }
  return value;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function applyCors(req, res) {
  // 1. 获取请求来源
  const origin = req.headers.origin;
  
  // 2. 允许的白名单域名（你的前端域名）
  const ALLOWED_ORIGINS = [
    'https://cursor-pro-2-b50d9eg70-daoges-projects-aef58dd7.vercel.app',
    'https://cursor-pro-2-ho3mxi5i0-daoges-projects-aef58dd7.vercel.app', // 新的前端域名
    'https://cursor-pro-2-m4jx9bg1y-daoges-projects-aef58dd7.vercel.app', // 补充最新的前端域名
    // 如果有其他域名，加在这里
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ];

  // 3. 判断并在响应头里返回 Origin
  // 如果请求带了 Origin 且在白名单里，就返回该 Origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // 宽容模式：只要有 Origin 就反射回去（仅供调试或快速上线，生产环境建议严格白名单）
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 4. 其他标准 CORS 头
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // 5. 关键：允许携带凭证（cookies/auth headers）
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 6. 缓存预检结果 24 小时
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 7. Vary Header (重要)
  res.setHeader('Vary', 'Origin');
}

function handleCors(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

async function parseJsonBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    const err = new Error('Invalid JSON body');
    err.code = 'INVALID_JSON';
    throw err;
  }
}

async function readBodySafe(req) {
  // 1) 如果平台已解析成对象，直接用
  if (req.body && typeof req.body === 'object') return req.body;

  // 2) 读原始文本
  let raw = '';
  try {
    for await (const chunk of req) {
      raw += chunk;
    }
  } catch (e) {
    console.error('[readBodySafe] Error reading stream:', e);
  }

  if (!raw) return {};

  // 3) 先按 JSON 解析
  try {
    return JSON.parse(raw);
  } catch (_) {}

  // 4) 再按 form-urlencoded 解析
  try {
    const { URLSearchParams } = require('url');
    const params = new URLSearchParams(raw);
    const obj = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return obj;
  } catch (_) {}

  return {};
}

function getHeader(req, name) {
  const key = name.toLowerCase();
  return req.headers[key] || req.headers[name] || req.headers[key.toString()] || null;
}

function generateOrderId() {
  const rand = crypto.randomBytes(8).toString('hex');
  return `order_${Date.now()}_${rand}`;
}

module.exports = {
  getEnv,
  sendJson,
  applyCors,
  handleCors,
  parseJsonBody,
  readBodySafe,
  getHeader,
  generateOrderId,
};





