import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * Health Check Endpoint
 * برای بررسی وضعیت سرور و دیتابیس
 */
export async function GET() {
  // #region agent log
  fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/health/route.ts:8',message:'Health check requested',data:{},timestamp:Date.now(),sessionId:'deploy-debug',runId:'runtime',hypothesisId:'health-check'})}).catch(()=>{});
  // #endregion

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
    
    // #region agent log
    fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/health/route.ts:20',message:'Database health check passed',data:{},timestamp:Date.now(),sessionId:'deploy-debug',runId:'runtime',hypothesisId:'db-health'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    health.status = 'error';
    health.database = 'error';
    
    // #region agent log
    fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/health/route.ts:30',message:'Database health check failed',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'deploy-debug',runId:'runtime',hypothesisId:'db-health-error'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(health, { status: 503 });
  }
}
