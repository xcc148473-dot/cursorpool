import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'db.json');

function ensureDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const seed = {
      products: [
        {
          id: 'chatgpt-business-team-seat',
          name: 'ChatGPT Business Team Shared Seat',
          priceUsd: 10,
          description: 'Shared seat in a ChatGPT Business team workspace. You bring your own email/account; we add you to the active team workspace after payment.'
        }
      ],
      orders: [
        {
          id: crypto.randomUUID(),
          orderNo: 'ORD-DEMO-1001',
          customerName: 'Demo Buyer',
          email: 'demo@example.com',
          contact: '@demo',
          productId: 'chatgpt-business-team-seat',
          amountUsd: 10,
          paymentStatus: 'paid',
          deliveryStatus: 'processing',
          note: 'Waiting for workspace invite confirmation.',
          createdAt: new Date().toISOString(),
          trackingToken: crypto.randomBytes(16).toString('hex')
        }
      ],
      messages: [
        {
          id: crypto.randomUUID(),
          orderNo: 'ORD-DEMO-1001',
          sender: 'customer',
          content: 'Hi, I paid already. When will you add my account?',
          createdAt: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          orderNo: 'ORD-DEMO-1001',
          sender: 'admin',
          content: 'Got it. We will process your seat and send an update here once done.',
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
  }
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function getProduct() {
  return readDb().products[0];
}

export function listOrders() {
  return readDb().orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getOrder(orderNo, email) {
  const db = readDb();
  return db.orders.find((o) => o.orderNo === orderNo && (!email || o.email.toLowerCase() === email.toLowerCase()));
}

export function getOrderByToken(token) {
  return readDb().orders.find((o) => o.trackingToken === token);
}

export function getMessages(orderNo) {
  return readDb().messages
    .filter((m) => m.orderNo === orderNo)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function addMessage({ orderNo, sender, content }) {
  const db = readDb();
  const msg = { id: crypto.randomUUID(), orderNo, sender, content, createdAt: new Date().toISOString() };
  db.messages.push(msg);
  writeDb(db);
  return msg;
}

export function updateOrder(orderNo, patch) {
  const db = readDb();
  const idx = db.orders.findIndex((o) => o.orderNo === orderNo);
  if (idx === -1) return null;
  db.orders[idx] = { ...db.orders[idx], ...patch };
  writeDb(db);
  return db.orders[idx];
}

export function createOrder({ customerName, email, contact, productId, amountUsd, paymentStatus = 'pending' }) {
  const db = readDb();
  const orderNo = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const order = {
    id: crypto.randomUUID(),
    orderNo,
    customerName,
    email,
    contact,
    productId,
    amountUsd,
    paymentStatus,
    deliveryStatus: 'new',
    note: '',
    createdAt: new Date().toISOString(),
    trackingToken: crypto.randomBytes(16).toString('hex')
  };
  db.orders.push(order);
  writeDb(db);
  return order;
}
