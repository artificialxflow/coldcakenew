import { prisma } from '../db/prisma';

export interface CreateOrderData {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: 'online' | 'phone' | 'manual' | 'cash_on_delivery';
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface UpdateOrderStatusData {
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

/** Persian year (approx): Gregorian - 621 */
function getPersianYear(): number {
  return new Date().getFullYear() - 621;
}

/**
 * Generate next unique invoice number (INV-1403-00001)
 */
async function generateNextInvoiceNumber(): Promise<string> {
  const year = getPersianYear();
  const prefix = `INV-${year}-`;
  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  });
  const nextSeq = last
    ? parseInt(last.invoiceNumber.slice(prefix.length), 10) + 1
    : 1;
  return `${prefix}${String(nextSeq).padStart(5, '0')}`;
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderData) {
  // Calculate total amount
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create order with items
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: data.customerId || undefined,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      shippingAddress: data.shippingAddress || undefined,
      notes: data.notes || undefined,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Update inventory (decrease stock)
  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (product && product.stock !== undefined) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: Math.max(0, product.stock - item.quantity),
        },
      });
    }
  }

  // Create invoice for the order
  const invoiceNumber = await generateNextInvoiceNumber();
  await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      totalAmount: order.totalAmount,
      tax: 0,
      discount: 0,
      status: 'issued',
    },
  });

  return order;
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
      customer: true,
    },
  });

  // If userId provided, check if user has access
  if (userId && order?.customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: order.customerId,
        userId,
      },
    });

    if (!customer) {
      throw new Error('Order not found or access denied');
    }
  }

  return order;
}

/**
 * Get order by order number
 */
export async function getOrderByOrderNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
      customer: true,
    },
  });
}

/**
 * Get orders by customer ID
 */
export async function getOrdersByCustomer(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters?.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      { customerName: { contains: filters.search, mode: 'insensitive' } },
      { customerPhone: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
      customer: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, data: UpdateOrderStatusData) {
  return prisma.order.update({
    where: { id },
    data: {
      status: data.status,
      paymentStatus: data.paymentStatus,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });
}

/**
 * Cancel order
 */
export async function cancelOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'completed') {
    throw new Error('Cannot cancel completed order');
  }

  // Restore inventory
  for (const item of order.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (product && product.stock !== undefined) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: product.stock + item.quantity,
        },
      });
    }
  }

  return prisma.order.update({
    where: { id },
    data: {
      status: 'cancelled',
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });
}
