import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}


