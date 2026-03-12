const { getEnv } = require('./utils');

const PAYGATE_WALLET_URL = 'https://api.paygate.to/control/wallet.php';

async function createPaymentLink(params) {
  const amount = Number(params.amount);
  const currency = String(params.currency || 'USD').toUpperCase();
  const checkoutDomain = (params.checkoutDomain || 'checkout.paygate.to').replace(/^https?:\/\//, '').replace(/\/+$/, '');

  const walletUrl = `${PAYGATE_WALLET_URL}?address=${encodeURIComponent(params.merchantWallet)}&callback=${encodeURIComponent(params.callbackUrl)}`;
  const walletRes = await fetch(walletUrl, { method: 'GET' });

  const walletText = await walletRes.text();
  let walletData;
  try {
    walletData = walletText ? JSON.parse(walletText) : null;
  } catch (e) {
    walletData = null;
  }

  if (!walletRes.ok || !walletData || !walletData.address_in) {
    const err = new Error('PayGate wallet generation failed');
    err.status = walletRes.status;
    err.body = walletData || walletText;
    throw err;
  }

  const generatedAddress = (() => {
    try {
      return decodeURIComponent(walletData.address_in);
    } catch (_) {
      return walletData.address_in;
    }
  })();

  const url = new URL(`https://${checkoutDomain}/pay.php`);
  url.searchParams.set('address', generatedAddress);
  url.searchParams.set('amount', String(amount));
  url.searchParams.set('email', params.customerEmail || '');
  url.searchParams.set('currency', currency);

  return {
    success: true,
    payment_url: url.toString(),
    order_id: walletData.polygon_address_in || walletData.address_in,
    ipn_token: walletData.polygon_address_in || walletData.address_in,
    callback_url: walletData.callback_url || null,
    provider: params.provider || null,
  };
}

async function checkPaymentStatusByToken(_token) {
  return { status: 'unknown' };
}

function pickProviderByAmount(amount) {
  const a = Number(amount || 0);
  if (a >= 30) return 'mercuryo';
  if (a >= 20) return 'moonpay';
  if (a >= 11) return 'unlimit';
  if (a >= 6) return 'paygatedottohosted';
  if (a >= 2) return 'wert';
  return 'paygatedottohosted';
}

function buildProviderFallbackChain(amount, forcedProvider) {
  const preferred = forcedProvider && forcedProvider !== 'auto'
    ? String(forcedProvider).toLowerCase()
    : pickProviderByAmount(amount);
  const fallback = [preferred, 'paygatedottohosted', 'wert', 'moonpay', 'mercuryo'];
  return [...new Set(fallback.filter(Boolean))];
}

function getChain2PayConfig() {
  return {
    merchantWallet: process.env.PAYGATE_MERCHANT_WALLET || getEnv('CHAIN2PAY_MERCHANT_WALLET', { required: true }),
    callbackUrl: process.env.PAYGATE_CALLBACK_URL || getEnv('CHAIN2PAY_CALLBACK_URL', { required: true }),
    provider: process.env.PAYGATE_PROVIDER || process.env.CHAIN2PAY_PROVIDER || 'auto',
    checkoutDomain: process.env.PAYGATE_CHECKOUT_DOMAIN || 'checkout.paygate.to',
  };
}

module.exports = {
  createPaymentLink,
  checkPaymentStatusByToken,
  pickProviderByAmount,
  buildProviderFallbackChain,
  getChain2PayConfig,
};
