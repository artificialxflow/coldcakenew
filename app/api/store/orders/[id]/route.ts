import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, cancelOrder } from '@/lib/services/order.service';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to get user for access control
    let userId: string | undefined;
    try {
      const user = await requireAuth(request);
      if (!(user instanceof NextResponse)) {
        userId = user.id;
      }
    } catch {
      // User not authenticated, allow public access to order by ID
    }

    const order = await getOrderById(id, userId);

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { status, paymentStatus, action } = body;

    // Handle cancel action
    if (action === 'cancel') {
      const order = await cancelOrder(id);
      return NextResponse.json(order);
    }

    // Update order status
    const order = await updateOrderStatus(id, { status, paymentStatus });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی سفارش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
