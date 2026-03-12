import Link from 'next/link';
import { getProduct } from '@/lib/db';

export default function HomePage() {
  const product = getProduct();

  return (
    <main className="container">
      <div className="header">
        <div className="badge">Minimal MVP</div>
        <nav>
          <Link href="/track">Track order</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>

      <section className="hero grid two">
        <div className="card">
          <div className="badge">$10 offer</div>
          <h1>ChatGPT Business Team shared seat</h1>
          <p>
            This product is a shared seat in a ChatGPT Business team workspace. The buyer uses their own
            email/account and is added to the active workspace after payment.
          </p>
          <div className="price">${product.priceUsd}</div>
          <p>
            Use this landing page as your minimum storefront. The payment button can call your existing
            payment backend API, and buyers can later track delivery and message you from their order page.
          </p>
          <div className="actions">
            <Link className="btn primary" href="/checkout">Buy now</Link>
            <Link className="btn secondary" href="/track">Track an order</Link>
          </div>
          <ul className="list">
            <li>• Product text clearly states this is a shared team seat.</li>
            <li>• Buyer can message you from the order tracking page.</li>
            <li>• Admin can review orders and mark delivery status.</li>
          </ul>
        </div>

        <div className="card">
          <h2>What this MVP already covers</h2>
          <div className="kpi">
            <div className="item">
              <div className="small">Price</div>
              <strong>$10 USD</strong>
            </div>
            <div className="item">
              <div className="small">Order flow</div>
              <strong>Create → Pay → Track</strong>
            </div>
            <div className="item">
              <div className="small">Support flow</div>
              <strong>Customer ↔ Admin messages</strong>
            </div>
          </div>
          <div className="section">
            <h3>Suggested product wording</h3>
            <p>
              {product.description}
            </p>
          </div>
          <div className="section">
            <h3>Next step for payment</h3>
            <p>
              Replace the demo checkout call with your existing payment API. After payment success, write or update
              the order in the app via the webhook endpoint.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
