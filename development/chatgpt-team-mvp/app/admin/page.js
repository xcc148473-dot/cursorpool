import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/auth';
import { getMessages, listOrders } from '@/lib/db';

async function saveAdminKey(formData) {
  'use server';
  const value = formData.get('adminKey');
  const cookieStore = await cookies();
  cookieStore.set('admin_key', value, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  redirect('/admin');
}

async function updateOrderAction(formData) {
  'use server';
  const { updateOrder } = await import('@/lib/db');
  const orderNo = formData.get('orderNo');
  const deliveryStatus = formData.get('deliveryStatus');
  const paymentStatus = formData.get('paymentStatus');
  const note = formData.get('note');
  updateOrder(orderNo, { deliveryStatus, paymentStatus, note });
  redirect('/admin');
}

async function replyAction(formData) {
  'use server';
  const { addMessage } = await import('@/lib/db');
  const orderNo = formData.get('orderNo');
  const content = formData.get('content');
  addMessage({ orderNo, sender: 'admin', content });
  redirect('/admin');
}

export default async function AdminPage() {
  const authed = await isAdmin();

  if (!authed) {
    return (
      <main className="container section">
        <div className="card" style={{ maxWidth: 520, margin: '40px auto' }}>
          <h1>Admin access</h1>
          <p>Enter the admin key from your environment to open the order dashboard.</p>
          <form className="form" action={saveAdminKey}>
            <div>
              <label>Admin key</label>
              <input type="password" name="adminKey" required />
            </div>
            <button className="primary" type="submit">Open dashboard</button>
          </form>
        </div>
      </main>
    );
  }

  const orders = listOrders();

  return (
    <main className="container section">
      <div className="header">
        <h1>Admin dashboard</h1>
        <div className="small">{orders.length} orders</div>
      </div>
      <div className="grid" style={{ gap: 16 }}>
        {orders.map((order) => {
          const messages = getMessages(order.orderNo);
          return (
            <div key={order.orderNo} className="card">
              <div className="grid two">
                <div>
                  <h2>{order.orderNo}</h2>
                  <p>{order.customerName} · {order.email} · {order.contact}</p>
                  <table className="table">
                    <tbody>
                      <tr><th>Payment</th><td><span className={`status ${order.paymentStatus}`}>{order.paymentStatus}</span></td></tr>
                      <tr><th>Delivery</th><td><span className={`status ${order.deliveryStatus}`}>{order.deliveryStatus}</span></td></tr>
                      <tr><th>Amount</th><td>${order.amountUsd}</td></tr>
                      <tr><th>Tracking token</th><td><span className="code">{order.trackingToken}</span></td></tr>
                    </tbody>
                  </table>
                  <form className="form" action={updateOrderAction}>
                    <input type="hidden" name="orderNo" value={order.orderNo} />
                    <div>
                      <label>Payment status</label>
                      <select name="paymentStatus" defaultValue={order.paymentStatus}>
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label>Delivery status</label>
                      <select name="deliveryStatus" defaultValue={order.deliveryStatus}>
                        <option value="new">new</option>
                        <option value="processing">processing</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </div>
                    <div>
                      <label>Internal note / customer-visible note</label>
                      <textarea name="note" defaultValue={order.note || ''} />
                    </div>
                    <button className="primary" type="submit">Save order</button>
                  </form>
                </div>

                <div>
                  <h3>Messages</h3>
                  <div className="messages">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`msg ${msg.sender === 'admin' ? 'admin' : ''}`}>
                        <strong>{msg.sender}</strong>
                        <p>{msg.content}</p>
                        <div className="small">{new Date(msg.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <form className="form" action={replyAction}>
                    <input type="hidden" name="orderNo" value={order.orderNo} />
                    <div>
                      <label>Reply</label>
                      <textarea name="content" required placeholder="Message the customer here..." />
                    </div>
                    <button className="secondary" type="submit">Send reply</button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
