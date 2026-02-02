import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCart, addToCart, getCart, clearCart } from '@/lib/services/cart.service';
import { requireAuth } from '@/lib/middleware/auth';

function getSessionId(request: NextRequest): string {
  // Try to get from cookie
  let sessionId = request.cookies.get('cart_session_id')?.value;

  if (!sessionId) {
    // Generate new session ID
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  return sessionId;
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    
    // Try to get user for customer ID
    let customerId: string | undefined;
    try {
      const user = await requireAuth(request);
      if (!(user instanceof NextResponse)) {
        // Find customer by user ID
        const { prisma } = await import('@/lib/db/prisma');
        const customer = await prisma.customer.findFirst({
          where: { userId: user.id },
        });
        if (customer) {
          customerId = customer.id;
        }
      }
    } catch {
      // User not authenticated, continue without customer ID
    }

    const cart = await getOrCreateCart(sessionId, customerId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سبد خرید', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص', message: 'لطفاً productId و quantity را ارسال کنید' },
        { status: 400 }
      );
    }

    // Try to get user for customer ID
    let customerId: string | undefined;
    try {
      const user = await requireAuth(request);
      if (!(user instanceof NextResponse)) {
        const { prisma } = await import('@/lib/db/prisma');
        const customer = await prisma.customer.findFirst({
          where: { userId: user.id },
        });
        if (customer) {
          customerId = customer.id;
        }
      }
    } catch {
      // User not authenticated, continue without customer ID
    }

    const cartItem = await addToCart(sessionId, { productId, quantity }, customerId);

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'خطا در افزودن به سبد خرید', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    await clearCart(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'خطا در پاک کردن سبد خرید', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
