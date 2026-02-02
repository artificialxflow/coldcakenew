import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { signAccessToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { username: username.trim() },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است.' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است.' },
        { status: 401 }
      );
    }

    const identifier = user.phone ?? user.username ?? user.email ?? '';
    const token = signAccessToken(user.id, identifier);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role ? { name: user.role.name } : null,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login password error:', error);
    return NextResponse.json(
      { error: 'خطا در ورود.' },
      { status: 500 }
    );
  }
}
