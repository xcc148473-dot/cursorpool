const { sendJson, handleCors } = require('../lib/utils'); 

module.exports = async function handler(req, res) { 
  if (handleCors(req, res)) return; 
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' }); 

  return sendJson(res, 200, { 
    ok: true, 
    provider: 'paygate', 
    stage: 'checkout-fiat-reached' 
  }); 
}; 
