import { prisma } from '../db/prisma';

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '';
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true';
const ZARINPAL_BASE_URL = ZARINPAL_SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://api.zarinpal.com/pg/v4/payment';
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://coldcake.ir';

export interface CreatePaymentData {
  orderId: string;
  amount: number;
  method: 'online' | 'phone' | 'manual' | 'cash';
  description?: string;
}

export interface ZarinpalPaymentRequest {
  merchant_id: string;
  amount: number;
  description: string;
  callback_url: string;
  metadata?: {
    mobile?: string;
    email?: string;
  };
}

export interface ZarinpalPaymentResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee: number;
    fee_type: string;
  };
  errors?: any;
}

export interface ZarinpalVerifyRequest {
  merchant_id: string;
  authority: string;
  amount: number;
}

export interface ZarinpalVerifyResponse {
  data: {
    code: number;
    message: string;
    ref_id: number;
    card_pan: string;
    card_hash: string;
    fee_type: string;
    fee: number;
  };
  errors?: any;
}

/**
 * Create payment record
 */
export async function createPayment(data: CreatePaymentData) {
  return prisma.payment.create({
    data: {
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      status: data.method === 'online' ? 'pending' : 'pending',
      notes: data.description,
    },
  });
}

/**
 * Create Zarinpal payment request
 */
export async function createZarinpalPayment(
  orderId: string,
  amount: number,
  description: string,
  customerPhone?: string,
  customerEmail?: string
): Promise<{ authority: string; paymentUrl: string }> {
  if (!ZARINPAL_MERCHANT_ID) {
    throw new Error('Zarinpal merchant ID not configured');
  }

  const callbackUrl = `${STORE_URL}/api/store/payments/callback`;

  const requestData: ZarinpalPaymentRequest = {
    merchant_id: ZARINPAL_MERCHANT_ID,
    amount: Math.round(amount / 10), // Convert to Toman (Zarinpal uses Toman)
    description,
    callback_url: callbackUrl,
  };

  if (customerPhone || customerEmail) {
    requestData.metadata = {};
    if (customerPhone) requestData.metadata.mobile = customerPhone;
    if (customerEmail) requestData.metadata.email = customerEmail;
  }

  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}/request.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result: ZarinpalPaymentResponse = await response.json();

    if (result.data.code === 100 && result.data.authority) {
      const paymentUrl = ZARINPAL_SANDBOX
        ? `https://sandbox.zarinpal.com/pg/StartPay/${result.data.authority}`
        : `https://www.zarinpal.com/pg/StartPay/${result.data.authority}`;

      // Create payment record
      await createPayment({
        orderId,
        amount,
        method: 'online',
        description,
      });

      // Update payment with authority
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          transactionId: result.data.authority,
          gateway: 'zarinpal',
        },
      });

      return {
        authority: result.data.authority,
        paymentUrl,
      };
    } else {
      throw new Error(result.data.message || 'Failed to create payment request');
    }
  } catch (error) {
    console.error('Zarinpal payment request error:', error);
    throw new Error('Failed to create payment request');
  }
}

/**
 * Verify Zarinpal payment
 */
export async function verifyZarinpalPayment(
  authority: string,
  amount: number
): Promise<{ success: boolean; refId?: number; message: string }> {
  if (!ZARINPAL_MERCHANT_ID) {
    throw new Error('Zarinpal merchant ID not configured');
  }

  const requestData: ZarinpalVerifyRequest = {
    merchant_id: ZARINPAL_MERCHANT_ID,
    authority,
    amount: Math.round(amount / 10), // Convert to Toman
  };

  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}/verify.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result: ZarinpalVerifyResponse = await response.json();

    if (result.data.code === 100 || result.data.code === 101) {
      // Find payment by authority
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: authority,
        },
        include: { order: true },
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            paidAt: new Date(),
            transactionId: result.data.ref_id.toString(),
          },
        });

        // Update order payment status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'paid',
            status: 'processing',
          },
        });
      }

      return {
        success: true,
        refId: result.data.ref_id,
        message: result.data.message,
      };
    } else {
      // Update payment status to failed
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: authority,
        },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'failed',
          },
        });
      }

      return {
        success: false,
        message: result.data.message || 'Payment verification failed',
      };
    }
  } catch (error) {
    console.error('Zarinpal payment verify error:', error);
    throw new Error('Failed to verify payment');
  }
}

/**
 * Create manual payment (phone or cash)
 */
export async function createManualPayment(
  orderId: string,
  amount: number,
  method: 'phone' | 'manual' | 'cash',
  notes?: string
) {
  const payment = await createPayment({
    orderId,
    amount,
    method,
    description: notes,
  });

  // For manual payments, mark as pending (admin will mark as paid later)
  return payment;
}

/**
 * Mark payment as paid (for manual payments)
 */
export async function markPaymentAsPaid(paymentId: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'completed',
      paidAt: new Date(),
    },
    include: { order: true },
  });

  // Update order payment status if all payments are completed
  const order = payment.order;
  const allPayments = await prisma.payment.findMany({
    where: { orderId: order.id },
  });

  const totalPaid = allPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid >= order.totalAmount) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
      },
    });
  }

  return payment;
}
