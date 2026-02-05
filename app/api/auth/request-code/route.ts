import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/services/otp";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "شماره موبایل الزامی است." }, { status: 400 });
    }

    await requestOtp(phone);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای غیرمنتظره رخ داد.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


