import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { verifyZarinpalPayment } from '@/lib/services/payment.service';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');

    if (!authority) {
      return redirect('/store/checkout?error=missing_authority');
    }

    if (status !== 'OK') {
      return redirect('/store/checkout?error=payment_failed');
    }

    // Find payment by authority
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: authority,
      },
      include: { order: true },
    });

    if (!payment) {
      return redirect('/store/checkout?error=payment_not_found');
    }

    // Verify payment
    const result = await verifyZarinpalPayment(authority, payment.amount);

    if (result.success) {
      return redirect(`/store/account/orders/${payment.orderId}?payment=success`);
    } else {
      return redirect(`/store/checkout?error=${encodeURIComponent(result.message)}`);
    }
  } catch (error) {
    console.error('Error in payment callback:', error);
    return redirect('/store/checkout?error=callback_error');
  }
}
