// file: lib/ipnVerify.js
const crypto = require('crypto');

function sortObjectDeep(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectDeep);
  }

  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  for (const key of sortedKeys) {
    result[key] = sortObjectDeep(obj[key]);
  }
  return result;
}

function parseAndSortBody(rawBody) {
  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch (e) {
    const err = new Error('Invalid JSON body for IPN');
    err.code = 'INVALID_JSON';
    throw err;
  }
  const sorted = sortObjectDeep(parsed);
  const sortedString = JSON.stringify(sorted);
  return { parsed, sortedString };
}

function verifyNowpaymentsSignature(sortedString, signatureHeader, secret) {
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(sortedString);
  const digest = hmac.digest('hex');

  const sigBuf = Buffer.from(signatureHeader, 'hex');
  const digBuf = Buffer.from(digest, 'hex');

  if (sigBuf.length !== digBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, digBuf);
}

module.exports = {
  sortObjectDeep,
  parseAndSortBody,
  verifyNowpaymentsSignature,
};





