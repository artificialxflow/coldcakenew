import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrdersByCustomer, getAllOrders } from '@/lib/services/order.service';
import { requireAuth } from '@/lib/middleware/auth';

function getSessionId(request: NextRequest): string {
  return request.cookies.get('cart_session_id')?.value || '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      shippingAddress,
      notes,
      items,
    } = body;

    if (!customerName || !customerPhone || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص', message: 'لطفاً تمام فیلدهای اجباری را پر کنید' },
        { status: 400 }
      );
    }

    // Try to get customer ID if user is authenticated
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

    const order = await createOrder({
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      shippingAddress,
      notes,
      items,
    });

    // Clear cart after order creation
    const sessionId = getSessionId(request);
    if (sessionId) {
      const { clearCart } = await import('@/lib/services/cart.service');
      await clearCart(sessionId);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد سفارش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isAdmin = searchParams.get('admin') === 'true';

    // Check if admin request
    if (isAdmin) {
      const user = await requireAuth(request);
      if (user instanceof NextResponse) {
        return user;
      }

      const status = searchParams.get('status') || undefined;
      const paymentStatus = searchParams.get('paymentStatus') || undefined;
      const search = searchParams.get('search') || undefined;

      const orders = await getAllOrders({ status, paymentStatus, search });
      return NextResponse.json(orders);
    }

    // Get customer orders
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { prisma } = await import('@/lib/db/prisma');
    const customer = await prisma.customer.findFirst({
      where: { userId: user.id },
    });

    if (!customer) {
      return NextResponse.json([]);
    }

    const orders = await getOrdersByCustomer(customer.id);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت سفارش‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
