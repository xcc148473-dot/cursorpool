import { NextResponse } from 'next/server';
import { updateOrder } from '@/lib/db';

export async function POST(request) {
  const body = await request.json();

  if (!body.orderNo) {
    return NextResponse.json({ error: 'orderNo is required' }, { status: 400 });
  }

  const updated = updateOrder(body.orderNo, {
    paymentStatus: body.paymentStatus || 'paid',
    deliveryStatus: body.deliveryStatus || 'processing',
    note: body.note || 'Payment confirmed. Processing order.'
  });

  if (!updated) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order: updated });
}
