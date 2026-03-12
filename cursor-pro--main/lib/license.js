// file: lib/license.js
const crypto = require('crypto');

function randomSegment(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

function generateLicenseKey() {
  return `KEY-${randomSegment(4)}-${randomSegment(4)}`;
}

function computeExpiry(hours) {
  const ms = (hours || 24) * 60 * 60 * 1000;
  const d = new Date(Date.now() + ms);
  return d.toISOString();
}

module.exports = {
  generateLicenseKey,
  computeExpiry,
};





