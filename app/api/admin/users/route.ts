import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'users.read');
  if (auth instanceof NextResponse) return auth;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کاربران', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, 'users.write');
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { username, email, password, roleId } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { username: username.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'این نام کاربری قبلاً ثبت شده است.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email?.trim() || undefined,
        passwordHash,
        roleId: roleId || undefined,
      },
      select: {
        id: true,
        username: true,
        email: true,
        roleId: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد کاربر', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
