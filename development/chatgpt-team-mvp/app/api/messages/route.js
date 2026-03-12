import { NextResponse } from 'next/server';
import { addMessage, getOrder } from '@/lib/db';

export async function POST(request) {
  const body = await request.json();

  if (!body.orderNo || !body.content) {
    return NextResponse.json({ error: 'orderNo and content are required' }, { status: 400 });
  }

  const order = getOrder(body.orderNo);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const message = addMessage({ orderNo: body.orderNo, sender: 'customer', content: body.content });
  return NextResponse.json({ ok: true, message });
}
