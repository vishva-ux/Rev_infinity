import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { db } from '@/lib/db/store';
import { FutureSimulator } from '@/lib/engine/simulator';

export async function POST(request: NextRequest) {
  ensureDatabaseInitialized();
  try {
    const body = await request.json();
    const transactionId = body.transactionId || 'TXN_92817';

    const transaction = db.transactions.get(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const customer = db.customerProfiles.get(transaction.customerId);
    const simulation = FutureSimulator.simulate(transaction, customer);
    db.simulations.set(simulation.id, simulation);

    return NextResponse.json(simulation);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
