import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requirePermission } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, 'users.read');
  if (auth instanceof NextResponse) return auth;

  try {
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نقش‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
