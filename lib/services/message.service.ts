import { prisma } from '../db/prisma';
import { generatePersonalizedMessage } from '../utils/messageGenerator';
import { selectCustomersForAutomatedMessaging, shouldRunAutomatedMessaging, generateAutomatedMessage } from '../utils/automatedMessaging';

export interface CreateMessageData {
  customerId: string;
  customerName: string;
  content: string;
  platform: 'telegram' | 'whatsapp' | 'rubika' | 'instagram';
  productId?: string;
  templateId?: string;
}

interface MessageResult {
  success: boolean;
  messageId?: string;
  platform?: string;
  error?: string;
}

export async function getMessages(userId: string, filters?: {
  customerId?: string;
  platform?: string;
  status?: string;
}) {
  const where: any = {
    customer: { userId },
  };

  if (filters?.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters?.platform) {
    where.platform = filters.platform;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  return prisma.message.findMany({
    where,
    include: {
      customer: true,
    },
    orderBy: { sentAt: 'desc' },
  });
}

export async function createMessage(userId: string, data: CreateMessageData) {
  // Verify customer ownership
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, userId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // TODO: Send message via platform API (Telegram, WhatsApp, etc.)
  // For now, just create the message record
  const message = await prisma.message.create({
    data: {
      ...data,
      sentAt: new Date(),
      status: 'sent', // In production, this should be determined by API response
    },
  });

  return message;
}

export async function getMessageTemplates() {
  return prisma.messageTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createMessageTemplate(data: {
  name: string;
  content: string;
  variables: string[];
}) {
  return prisma.messageTemplate.create({
    data,
  });
}

export async function runAutomatedMessaging(userId: string) {
  // Get settings
  const settings = await prisma.businessSettings.findFirst();
  if (!settings || !settings.automatedMessaging) {
    throw new Error('Automated messaging not configured');
  }

  const automatedSettings = settings.automatedMessaging as any;
  if (!automatedSettings.enabled) {
    throw new Error('Automated messaging is disabled');
  }

  // Get all customers
  const customers = await prisma.customer.findMany({
    where: { userId },
  });

  // Get products
  const products = await prisma.product.findMany();

  // Get existing messages
  const messages = await prisma.message.findMany({
    where: { customer: { userId } },
  });

  // Select customers
  const selectedCustomers = selectCustomersForAutomatedMessaging(
    customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone ?? undefined,
      email: c.email ?? undefined,
      favoriteProducts: c.favoriteProducts || [],
      preferences: (c.preferences as any) ?? undefined,
      lastSuggestedProduct: c.lastSuggestedProduct ?? undefined,
      lastPurchaseDate: c.lastPurchaseDate?.toISOString(),
      totalPurchases: c.totalPurchases ?? undefined,
      purchaseHistory: [],
      visitHistory: [],
      socialInteractions: [],
      manualDebtBalance: c.manualDebtBalance ?? undefined,
    })),
    automatedSettings,
    messages.map((m) => ({
      id: m.id,
      customerId: m.customerId,
      customerName: m.customerName,
      content: m.content,
      platform: m.platform as 'telegram' | 'whatsapp' | 'rubika' | 'instagram',
      sentAt: m.sentAt.toISOString(),
      status: m.status as 'sent' | 'failed' | 'pending',
      productId: m.productId ?? undefined,
      templateId: m.templateId ?? undefined,
      isAutomated: m.isAutomated ?? undefined,
      automationRunId: m.automationRunId ?? undefined,
    }))
  );

  // Get best selling products once for all customers
  const { getBestSellingProducts } = await import('./sale.service');
  const bestSellingProducts = await getBestSellingProducts(userId, 5);

  // Generate and send messages
  const messageResults: MessageResult[] = [];
  for (const customer of selectedCustomers) {
    const { message, product } = await generateAutomatedMessage(
      {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone ?? undefined,
        email: customer.email ?? undefined,
        favoriteProducts: customer.favoriteProducts || [],
        preferences: (customer.preferences as any) ?? undefined,
        lastSuggestedProduct: customer.lastSuggestedProduct ?? undefined,
        lastPurchaseDate: customer.lastPurchaseDate,
        totalPurchases: customer.totalPurchases ?? undefined,
        purchaseHistory: [],
        visitHistory: [],
        socialInteractions: [],
        manualDebtBalance: customer.manualDebtBalance ?? undefined,
      },
      products.map((p) => ({
        id: p.id,
        name: p.name,
        originalPrice: p.originalPrice,
        finalPrice: p.finalPrice,
        color: p.color ?? undefined,
        category: p.category ?? undefined,
        stock: p.stock ?? undefined,
        description: p.description ?? undefined,
        discountedPrice: p.discountedPrice ?? undefined,
        priceHistory: [],
      })),
      settings as any,
      userId,
      bestSellingProducts.map((p) => ({
        id: p.id,
        name: p.name,
        originalPrice: p.originalPrice,
        finalPrice: p.finalPrice,
        color: p.color ?? undefined,
        category: p.category ?? undefined,
        stock: p.stock ?? undefined,
        description: p.description ?? undefined,
        discountedPrice: p.discountedPrice ?? undefined,
        priceHistory: [],
      }))
    );

    if (message && product) {
      // Send to all configured platforms simultaneously
      const platforms = automatedSettings.platforms || ['telegram'];
      const platformPromises = platforms.map(async (platform: string) => {
        try {
          // TODO: Actually send via platform API (Telegram, WhatsApp, etc.)
          // For now, just create the message record
          const sentMessage = await prisma.message.create({
            data: {
              customerId: customer.id,
              customerName: `${customer.firstName} ${customer.lastName}`,
              content: message,
              platform: platform as 'telegram' | 'whatsapp' | 'rubika' | 'instagram',
              productId: product.id,
              isAutomated: true,
              sentAt: new Date(),
              status: 'sent', // In production, determine by API response
            },
          });
          return { success: true, messageId: sentMessage.id, platform };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            platform 
          };
        }
      });

      // Wait for all platforms to complete
      const platformResults = await Promise.allSettled(platformPromises);
      platformResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          messageResults.push(result.value);
        } else {
          messageResults.push({ 
            success: false, 
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error' 
          });
        }
      });
    }
  }

  // Create run record
  const totalCustomers = selectedCustomers.length;
  const sentMessages = messageResults.filter((r) => r.success).length;
  const failedMessages = messageResults.filter((r) => !r.success).length;
  const successRate = totalCustomers > 0 ? (sentMessages / totalCustomers) * 100 : 0;

  const run = await prisma.automatedMessageRun.create({
    data: {
      scheduledAt: new Date(),
      executedAt: new Date(),
      status: failedMessages === 0 ? 'completed' : 'failed',
      frequency: automatedSettings.frequency || 'daily',
      totalCustomers,
      sentMessages,
      failedMessages,
      successRate,
      messages: messageResults.filter((r) => r.success && 'messageId' in r).map((r) => (r as { success: true; messageId: string }).messageId),
      error: failedMessages > 0 ? `${failedMessages} messages failed` : undefined,
    },
  });

  return run;
}
