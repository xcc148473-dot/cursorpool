// file: api/checkout.js
const crypto = require('crypto');
const { getEnv, sendJson, readBodySafe, generateOrderId, handleCors } = require('../lib/utils');
const { insertOrder, updateOrderByOrderId } = require('../lib/supabase');
// Removed: const { createPaymentLink, buildProviderFallbackChain, getChain2PayConfig } = require('../lib/chain2pay');
const { notifyNewOrder } = require('../lib/feishu');

function normalizeProviderName(input) {
  const raw = String(input || '').trim().toLowerCase();
  const compact = raw.replace(/[\s._-]+/g, '');
  const aliasMap = {
    // 官网命名兼容
    'wert': 'wertio',
    'wertio': 'wertio',
    'ramp': 'rampnetwork',
    'rampnetwork': 'rampnetwork',
    'moonpay': 'moonpay',
    'stripe': 'stripe',
    'robinhood': 'robinhood',
    'revolut': 'revolut',
    'guardarian': 'guardarian',
    'transak': 'transak',
    'particlenetwork': 'particlenetwork',
    'particle': 'particlenetwork',
    'mercuryo': 'mercuryoio',
    'mercuryoio': 'mercuryoio',
    'banxa': 'banxa',
    'alchemypay': 'alchemypay',
    'utorg': 'utorg',
    'transfi': 'transfi',
    'changenow': 'changenow',
    'sardine': 'sardineai',
    'sardineai': 'sardineai',
    'unlimit': 'unlimit',
    'simpleswap': 'simpleswap',
    // 旧值兼容
    'paygatedottohosted': 'paygatedottohosted',
  };
  return aliasMap[compact] || compact || 'wertio';
}

function parseProviderList(value, fallback) {
  const list = String(value || '')
    .split(',')
    .map((s) => normalizeProviderName(s))
    .filter(Boolean);
  return list.length ? [...new Set(list)] : fallback;
}

function pickPaygateProvider(_amount, forcedProvider) {
  if (forcedProvider && forcedProvider !== 'auto') return normalizeProviderName(forcedProvider);

  // 所有套餐统一优先 wert.io（用户要求）
  const defaultOrder = ['wertio', 'rampnetwork', 'stripe', 'robinhood', 'revolut'];
  const ordered = parseProviderList(process.env.PAYGATE_PROVIDER_ORDER, defaultOrder);
  return ordered[0] || 'wertio';
}

// 计划价格映射（USD）
// 兼容旧套餐（day/week/month/year）与新套餐（CursorPool/CursorPro）
const PLAN_PRICES = {
  // Legacy
  day: 3,
  week: 15,
  month: 40,
  year: 400,

  // Cursor Pool (new)
  p7d: 20,
  p30d: 50,
  p90d: 140,
  p180d: 260,
  p365d: 500,

  // Cursor Pool (new - quota plans)
  q10k_180d: 220,
  q30k_365d: 450,

  // ChatGPT Business team shared seat
  gpt_team_30d: 10,
};

const PLAN_ALIASES = {
  // legacy -> new pool ids (for compatibility)
  day: 'p7d',
  week: 'p30d',
  month: 'p90d',
  year: 'p365d',

  // frontend ids / human-friendly aliases
  pool_7d: 'p7d',
  pool_30d: 'p30d',
  pool_90d: 'p90d',
  pool_180d: 'p180d',
  pool_365d: 'p365d',
  cursorpool_7d: 'p7d',
  cursorpool_30d: 'p30d',
  cursorpool_90d: 'p90d',
  cursorpool_180d: 'p180d',
  cursorpool_365d: 'p365d',
  cursorpool_10k_180d: 'q10k_180d',
  cursorpool_30k_365d: 'q30k_365d',
  cursorpro_10k_180d: 'q10k_180d', // backward compatibility
  cursorpro_30k_365d: 'q30k_365d', // backward compatibility

  // ChatGPT team seat aliases
  chatgpt_team: 'gpt_team_30d',
  business_team: 'gpt_team_30d',
  gptteam: 'gpt_team_30d',
  team_shared_30d: 'gpt_team_30d',
};

function normalizePlan(plan) {
  const raw = String(plan || '').trim();
  return PLAN_ALIASES[raw] || raw;
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed', message: 'Only POST is allowed' });
  }

  try {
    const { email, plan, payment_method, site_url } = await readBodySafe(req);

    if (!email || typeof email !== 'string') {
      return sendJson(res, 400, { error: 'invalid_email', message: 'email is required' });
    }

    const normalizedPlan = normalizePlan(plan);

    if (!plan || typeof plan !== 'string' || !PLAN_PRICES[normalizedPlan]) {
      return sendJson(res, 400, {
        error: 'invalid_plan',
        message: 'unsupported plan',
        supported: Object.keys(PLAN_PRICES),
      });
    }

    const priceAmount = PLAN_PRICES[normalizedPlan];
    const priceCurrency = 'USD';
    const orderId = generateOrderId();
    const fallbackSiteUrl = process.env.FRONTEND_SITE_URL || getEnv('SITE_URL', { required: true });
    const siteUrl = typeof site_url === 'string' && /^https?:\/\//i.test(site_url.trim())
      ? site_url.trim().replace(/\/$/, '')
      : fallbackSiteUrl.replace(/\/$/, '');

    // 默认支付方式逻辑：如果有 payment_method 参数则遵循，否则默认为 crypto (NOWPayments) 
    // 或者根据业务需求默认 fiat。这里假设默认 crypto 以保持向前兼容（如果之前是 NP）
    // 但根据用户最近的修改，之前是 Chain2Pay。
    // 让我们支持 'fiat' (Chain2Pay) and 'crypto' (NOWPayments)
    const method = payment_method || 'fiat'; 

    // ==========================================
    // 分支 A: 加密货币 (NOWPayments)
    // ==========================================
    if (method === 'crypto') {
        const apiKey = getEnv('NOWPAYMENTS_API_KEY', { required: true });
        const ipnUrl = `${getEnv('IPN_CALLBACK_URL') || siteUrl + '/api/nowpayments-ipn'}`;
        
        // NOWPayments 创建 Invoice
        const npResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                price_amount: priceAmount,
                price_currency: 'usd',
                order_id: orderId,
                order_description: `Plan: ${normalizedPlan}`, 
                ipn_callback_url: ipnUrl,
                success_url: `${siteUrl}/order-status.html?order_id=${orderId}&email=${encodeURIComponent(email)}`,
                cancel_url: `${siteUrl}/buy.html`,
            }),
        });

        const npData = await npResponse.json();
        
        if (!npResponse.ok) {
             throw new Error(npData.message || 'Failed to create NOWPayments invoice');
        }

        // 插入订单
        await insertOrder({
            order_id: orderId,
            email,
            plan: normalizedPlan,
            price_amount: priceAmount,
            price_currency: priceCurrency,
            np_invoice_id: npData.id,
            np_payment_id: null, // IPN 会更新这个
            np_status: 'waiting',
            c2p_status: null, // 不使用 Chain2Pay
            is_delivered: false,
        });
        
        // 飞书通知
        await notifyNewOrder(orderId, normalizedPlan, priceAmount, email);

        return sendJson(res, 200, {
            payment_url: npData.invoice_url,
            order_id: orderId,
            provider: 'nowpayments',
            return_url: `${siteUrl}/order-status.html?order_id=${orderId}&email=${encodeURIComponent(email)}`,
        });
    }

    // ==========================================
    // 分支 B: 法币 (PayGate 直接模式 - 无 API Key)
    // ==========================================
    // 从环境变量获取基础配置
    const merchantWallet = process.env.PAYGATE_MERCHANT_WALLET;
    const callbackUrlBase = process.env.PAYGATE_CALLBACK_URL || `${siteUrl}/api/chain2pay-callback`;
    const checkoutDomain = process.env.PAYGATE_CHECKOUT_DOMAIN || 'checkout.paygate.to';
    const forcedProvider = (process.env.PAYGATE_PROVIDER || 'wert').toLowerCase();

    if (!merchantWallet) {
      throw new Error('PAYGATE_MERCHANT_WALLET is required (use your 0x wallet address)');
    }

    const successUrl = `${siteUrl}/order-status.html?order_id=${orderId}&email=${encodeURIComponent(email)}`;

    // 1. 在 Supabase 中创建订单
    await insertOrder({
      order_id: orderId,
      email,
      plan: normalizedPlan,
      price_amount: priceAmount,
      price_currency: priceCurrency,
      np_status: null,
      c2p_status: 'unpaid',
      is_delivered: false,
    });

    // 2. 构造 PayGate 回调地址 (带签名校验)
    const secret = crypto.createHash('sha256').update(`paygate_salt_${merchantWallet}`).digest('hex');
    const sig = crypto.createHmac('sha256', secret).update(orderId).digest('hex');
    const callbackUrl = `${callbackUrlBase}${callbackUrlBase.includes('?') ? '&' : '?'}order_id=${encodeURIComponent(orderId)}&sig=${encodeURIComponent(sig)}`;

    // 3. 0x 方案：wallet.php 生成临时地址，再跳 pay.php
    const selectedProvider = pickPaygateProvider(priceAmount, forcedProvider);
    const walletApiUrl = `https://api.paygate.to/control/wallet.php?address=${encodeURIComponent(merchantWallet)}&callback=${encodeURIComponent(callbackUrl)}`;
    const walletRes = await fetch(walletApiUrl);
    const walletText = await walletRes.text();
    let walletData;
    try {
      walletData = JSON.parse(walletText);
    } catch (_) {
      throw new Error(`Failed to parse PayGate wallet response: ${walletText.slice(0, 120)}`);
    }
    if (!walletRes.ok || !walletData || !walletData.address_in) {
      throw new Error(`PayGate wallet generation failed: ${walletData?.message || walletText.slice(0, 120)}`);
    }

    const finalAddress = decodeURIComponent(walletData.address_in);
    const finalPayUrl = new URL(`https://${checkoutDomain}/pay.php`);
    finalPayUrl.searchParams.set('address', finalAddress);
    finalPayUrl.searchParams.set('amount', String(priceAmount));
    finalPayUrl.searchParams.set('provider', selectedProvider || 'wertio');
    finalPayUrl.searchParams.set('email', email);
    finalPayUrl.searchParams.set('currency', priceCurrency);

    const c2pOrderRef = walletData.polygon_address_in || finalAddress;

    // 5. 更新订单记录中的支付链接相关信息
    await updateOrderByOrderId(orderId, {
      c2p_payment_url: finalPayUrl.toString(),
      c2p_order_id: c2pOrderRef,
    });

    // 6. 飞书通知新订单
    await notifyNewOrder(orderId, normalizedPlan, priceAmount, email);

    return sendJson(res, 200, {
      payment_url: finalPayUrl.toString(),
      order_id: orderId,
      provider: `paygate:${selectedProvider || 'auto'}`,
      return_url: successUrl,
    });
  } catch (err) {
    console.error('Error in /api/checkout:', {
      message: err?.message,
      status: err?.status,
      body: err?.body,
      stack: err?.stack,
    });

    const detailObj = {
      message: err?.message || String(err),
      status: err?.status || null,
      body: err?.body || null,
    };

    const detailText = (() => {
      try {
        return JSON.stringify(detailObj);
      } catch (_) {
        return String(err?.message || err || 'unknown_error');
      }
    })();

    return sendJson(res, 500, {
      error: 'internal_error',
      message: detailObj.message,
      details: detailText,
    });
  }
};


