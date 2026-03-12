'use client';

import { useState } from 'react';

export default function TrackPage() {
  const [state, setState] = useState({ loading: false, order: null, messages: [], error: '' });

  async function handleLookup(formData) {
    setState({ loading: true, order: null, messages: [], error: '' });
    const qs = new URLSearchParams(Object.fromEntries(formData.entries()));
    const res = await fetch(`/api/order?${qs.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      setState({ loading: false, order: null, messages: [], error: data.error || 'Not found' });
      return;
    }
    setState({ loading: false, order: data.order, messages: data.messages, error: '' });
  }

  async function handleMessage(formData) {
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to send');
      return;
    }
    setState((s) => ({ ...s, messages: [...s.messages, data.message] }));
  }

  return (
    <main className="container section">
      <div className="grid two">
        <div className="card">
          <h1>Track your order</h1>
          <p>Enter your order number and email to view order details and message support.</p>
          <form className="form" action={handleLookup}>
            <div>
              <label>Order number</label>
              <input name="orderNo" placeholder="ORD-20260312-1234" required />
            </div>
            <div>
              <label>Email</label>
              <input name="email" type="email" required />
            </div>
            <button className="primary" type="submit">{state.loading ? 'Loading...' : 'View order'}</button>
          </form>
          {state.error && <p style={{ color: '#ff8585' }}>{state.error}</p>}
        </div>

        <div className="card">
          <h2>Demo order</h2>
          <p>Use <span className="code">ORD-DEMO-1001</span> and <span className="code">demo@example.com</span> to preview the flow.</p>
        </div>
      </div>

      {state.order && (
        <div className="grid two section">
          <div className="card">
            <h2>Order details</h2>
            <table className="table">
              <tbody>
                <tr><th>Order</th><td>{state.order.orderNo}</td></tr>
                <tr><th>Email</th><td>{state.order.email}</td></tr>
                <tr><th>Contact</th><td>{state.order.contact}</td></tr>
                <tr><th>Payment</th><td><span className={`status ${state.order.paymentStatus}`}>{state.order.paymentStatus}</span></td></tr>
                <tr><th>Delivery</th><td><span className={`status ${state.order.deliveryStatus}`}>{state.order.deliveryStatus}</span></td></tr>
                <tr><th>Amount</th><td>${state.order.amountUsd}</td></tr>
                <tr><th>Note</th><td>{state.order.note || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2>Message support</h2>
            <form className="form" action={handleMessage}>
              <input type="hidden" name="orderNo" value={state.order.orderNo} />
              <div>
                <label>Your message</label>
                <textarea name="content" required placeholder="Ask about delivery, invite, setup, or order issues..." />
              </div>
              <button className="primary" type="submit">Send message</button>
            </form>
            <div className="messages">
              {state.messages.map((msg) => (
                <div key={msg.id} className={`msg ${msg.sender === 'admin' ? 'admin' : ''}`}>
                  <strong>{msg.sender === 'admin' ? 'Support' : 'You'}</strong>
                  <p>{msg.content}</p>
                  <div className="small">{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
