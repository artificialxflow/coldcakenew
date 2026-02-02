import { NextRequest, NextResponse } from 'next/server';
import { verifyZarinpalPayment } from '@/lib/services/payment.service';
import { getOrderByOrderNumber } from '@/lib/services/order.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authority, amount } = body;

    if (!authority || !amount) {
      return NextResponse.json(
        { error: 'اطلاعات ناقص', message: 'لطفاً authority و amount را ارسال کنید' },
        { status: 400 }
      );
    }

    const result = await verifyZarinpalPayment(authority, amount);

    if (result.success) {
      return NextResponse.json({
        success: true,
        refId: result.refId,
        message: 'پرداخت با موفقیت انجام شد',
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'خطا در تأیید پرداخت', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
