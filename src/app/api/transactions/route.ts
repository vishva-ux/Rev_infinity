import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { db } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  ensureDatabaseInitialized();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let list = Array.from(db.transactions.values());

  if (status && status !== 'ALL') {
    list = list.filter(t => t.status === status);
  }

  if (search) {
    list = list.filter(t => 
      t.id.toLowerCase().includes(search) ||
      t.customerId.toLowerCase().includes(search) ||
      (t.customerName && t.customerName.toLowerCase().includes(search)) ||
      (t.bankCode && t.bankCode.toLowerCase().includes(search))
    );
  }

  // Sort by latest
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    total: list.length,
    data: list.slice(0, limit)
  });
}
