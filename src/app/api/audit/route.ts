import { NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { db } from '@/lib/db/store';

export async function GET() {
  ensureDatabaseInitialized();
  return NextResponse.json({
    total: db.auditLogs.length,
    data: db.auditLogs
  });
}
