import { NextResponse } from 'next/server';
import { createOrder, getProduct } from '@/lib/db';

export async function POST(request) {
  const body = await request.json();
  const product = getProduct();

  if (!body.customerName || !body.email || !body.contact) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const order = createOrder({
    customerName: body.customerName,
    email: body.email,
    contact: body.contact,
    productId: product.id,
    amountUsd: product.priceUsd,
    paymentStatus: 'pending'
  });

  const base = process.env.PAYMENT_API_BASE;
  const fakeCheckoutUrl = `${process.env.SITE_URL || 'http://localhost:3000'}/track?created=${order.orderNo}`;

  return NextResponse.json({
    ok: true,
    order,
    next: 'Replace this stub with a call to your payment backend API.',
    paymentApiBase: base || null,
    checkoutUrl: fakeCheckoutUrl
  });
}
