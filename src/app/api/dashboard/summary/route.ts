import { NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { db } from '@/lib/db/store';

export async function GET() {
  ensureDatabaseInitialized();
  const summary = db.getDashboardSummary();
  return NextResponse.json(summary);
}
