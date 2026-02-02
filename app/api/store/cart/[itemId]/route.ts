import { NextRequest, NextResponse } from 'next/server';
import { updateCartItem, removeFromCart } from '@/lib/services/cart.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص', message: 'quantity باید بیشتر از 0 باشد' },
        { status: 400 }
      );
    }

    const cartItem = await updateCartItem(itemId, { quantity });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی سبد خرید', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    await removeFromCart(itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'خطا در حذف از سبد خرید', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
