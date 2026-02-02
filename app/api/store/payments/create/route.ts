import { NextRequest, NextResponse } from 'next/server';
import { createZarinpalPayment, createManualPayment } from '@/lib/services/payment.service';
import { getOrderById } from '@/lib/services/order.service';
import { requireAuth } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, notes } = body;

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص', message: 'لطفاً orderId و paymentMethod را ارسال کنید' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'سفارش یافت نشد' },
        { status: 404 }
      );
    }

    if (paymentMethod === 'online') {
      // Create Zarinpal payment
      const result = await createZarinpalPayment(
        orderId,
        order.totalAmount,
        `پرداخت سفارش ${order.orderNumber}`,
        order.customerPhone,
        order.customerEmail || undefined
      );

      return NextResponse.json({
        paymentUrl: result.paymentUrl,
        authority: result.authority,
      });
    } else {
      // Create manual payment
      const payment = await createManualPayment(
        orderId,
        order.totalAmount,
        paymentMethod as 'phone' | 'manual' | 'cash',
        notes
      );

      return NextResponse.json({
        payment,
        message: 'پرداخت دستی ثبت شد. پس از تأیید، وضعیت سفارش به‌روزرسانی می‌شود.',
      });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد پرداخت', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
