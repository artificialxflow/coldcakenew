import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedInventory = inventory.map((inv) => ({
      id: inv.id,
      productId: inv.productId,
      productName: inv.productName,
      quantity: inv.quantity,
      purchasePrice: inv.purchasePrice || 0,
      purchaseDate: inv.purchaseDate?.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedInventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت موجودی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
