import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { OutcomeObserver } from '@/lib/engine/executor';

export async function POST(request: NextRequest) {
  ensureDatabaseInitialized();
  try {
    const body = await request.json();
    // In production: verify x-razorpay-signature here
    const result = OutcomeObserver.handleWebhook(body);
    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
