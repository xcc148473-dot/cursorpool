import { NextResponse } from 'next/server';
import { getMessages, getOrder } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderNo = searchParams.get('orderNo');
  const email = searchParams.get('email');

  if (!orderNo || !email) {
    return NextResponse.json({ error: 'orderNo and email are required' }, { status: 400 });
  }

  const order = getOrder(orderNo, email);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order, messages: getMessages(order.orderNo) });
}
