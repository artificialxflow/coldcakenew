import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/services/otp";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "شماره موبایل و کد الزامی است." }, { status: 400 });
    }

    const result = await verifyOtp(phone, code);

    return NextResponse.json({ success: true, user: { id: result.user.id, phone: result.user.phone } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای غیرمنتظره رخ داد.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


