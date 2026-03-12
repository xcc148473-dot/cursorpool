'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(formData) {
    setLoading(true);
    setResult(null);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);

    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
  }

  return (
    <main className="container section">
      <div className="card" style={{ maxWidth: 760, margin: '24px auto' }}>
        <h1>Checkout</h1>
        <p>Collect buyer details, create a local order, then hand off to your existing payment backend.</p>
        <form className="form" action={handleSubmit}>
          <div>
            <label>Name</label>
            <input name="customerName" required />
          </div>
          <div>
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <div>
            <label>Contact handle</label>
            <input name="contact" placeholder="Telegram / WhatsApp / Discord / X" required />
          </div>
          <div>
            <label>Product</label>
            <input value="ChatGPT Business Team Shared Seat - $10" disabled />
          </div>
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Creating order...' : 'Continue to payment'}</button>
        </form>

        {result && (
          <div className="section">
            <h3>Checkout response</h3>
            <pre className="small">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
