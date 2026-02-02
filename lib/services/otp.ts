import { prisma } from "../db/prisma";
import { hashValue, compareHash } from "../auth/hash";
import { sendOtpSms } from "../vendors/taban-sms";
import { signAccessToken } from "../auth/jwt";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "../auth/constants";

const OTP_EXPIRATION_MINUTES = Number(process.env.OTP_EXPIRATION_MINUTES || 5);
const OTP_MAX_ATTEMPTS = 5;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("09") && digits.length === 11) return digits;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  if (digits.startsWith("98") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.startsWith("+98") && digits.length === 13) return `0${digits.slice(3)}`;
  return phone;
}

function generateOtpCode(length = 4) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function requestOtp(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  const code = generateOtpCode(4);
  const codeHash = await hashValue(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.smsCode.upsert({
    where: { phone: normalizedPhone },
    update: { codeHash, expiresAt, attempts: 0, used: false },
    create: { phone: normalizedPhone, codeHash, expiresAt },
  });

  const smsResult = await sendOtpSms(normalizedPhone, code);
  if (!smsResult.success) {
    console.error("[OTP] SMS send failed:", smsResult.error, smsResult.errorCode);
    throw new Error(smsResult.error || "خطا در ارسال پیامک تأیید.");
  }

  return { success: true };
}

export async function verifyOtp(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);
  const record = await prisma.smsCode.findFirst({
    where: { phone: normalizedPhone, used: false },
  });

  if (!record) {
    throw new Error("کدی برای این شماره ارسال نشده است.");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("کد منقضی شده است.");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("تعداد تلاش‌ها بیش از حد مجاز است.");
  }

  const isValid = await compareHash(code, record.codeHash);
  if (!isValid) {
    await prisma.smsCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("کد وارد شده صحیح نیست.");
  }

  const user = await prisma.user.upsert({
    where: { phone: normalizedPhone },
    update: {},
    create: { phone: normalizedPhone },
  });

  await prisma.smsCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  const token = signAccessToken(user.id, user.phone ?? user.id);
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
  });

  return { success: true, user };
}


