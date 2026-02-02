import { prisma } from '../db/prisma';

/**
 * Get invoice by order ID (with order and items)
 */
export async function getInvoiceByOrderId(orderId: string) {
  return prisma.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      },
    },
  });
}

/**
 * Get invoice by invoice number
 */
export async function getInvoiceByInvoiceNumber(invoiceNumber: string) {
  return prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      order: {
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      },
    },
  });
}

/**
 * List invoices (admin)
 */
export async function listInvoices(filters?: {
  fromDate?: Date;
  toDate?: Date;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const where: { issuedAt?: { gte?: Date; lte?: Date }; status?: string } = {};
  if (filters?.fromDate || filters?.toDate) {
    where.issuedAt = {};
    if (filters.fromDate) where.issuedAt.gte = filters.fromDate;
    if (filters.toDate) where.issuedAt.lte = filters.toDate;
  }
  if (filters?.status) {
    where.status = filters.status;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total };
}
