import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Health Check Endpoint
 * برای بررسی وضعیت سرور و دیتابیس
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    database: 'unknown' as 'ok' | 'error' | 'unknown',
  };

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'ok';

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    health.status = 'error';
    health.database = 'error';

    return NextResponse.json(health, { status: 503 });
  }
}
