
// lib/vendor.js
// Mock vendor implementation. Replace with real API calls.

/**
 * Purchase a license key from the vendor.
 * @param {string} plan - The plan identifier (e.g., 'day', 'week', 'month', 'year')
 * @returns {Promise<{success: boolean, key: string, vendor_order_id: string}>}
 */
async function purchaseKey(plan) {
  console.log(`[Vendor] Purchasing key for plan: ${plan}`);
  
  // Simulate network delay (500ms - 1500ms)
  const delay = Math.floor(Math.random() * 1000) + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional failure (e.g. out of stock or API timeout)
  // 95% success rate
  if (Math.random() > 0.05) {
    const mockKey = `MOCK-KEY-${plan.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const mockVendorId = `V-${Date.now()}`;
    console.log(`[Vendor] Purchase successful: ${mockKey}`);
    return {
      success: true,
      key: mockKey,
      vendor_order_id: mockVendorId
    };
  } else {
    console.error(`[Vendor] Purchase failed: Simulated error`);
    throw new Error('Vendor purchase failed: Simulated out of stock or timeout');
  }
}

module.exports = { purchaseKey };
