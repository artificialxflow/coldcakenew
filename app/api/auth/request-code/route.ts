import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/services/otp";

export async function POST(req: Request) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/request-code/route.ts:5',message:'request-code:entry',data:{hasDatabaseUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    const { phone } = await req.json();

    if (!phone) {
      // #region agent log
      fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/request-code/route.ts:9',message:'request-code:missing-phone',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "شماره موبایل الزامی است." }, { status: 400 });
    }

    await requestOtp(phone);

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? { name: error.name, message: error.message } : { name: "Unknown", message: "non-error thrown" };
    // #region agent log
    fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/auth/request-code/route.ts:17',message:'request-code:error',data:{err},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const message = error instanceof Error ? error.message : "خطای غیرمنتظره رخ داد.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


