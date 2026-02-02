import { prisma } from '../db/prisma';
import {
  generateSeasonalPredictions,
  getCurrentSeason,
} from '../utils/seasonalPredictor';

export async function getCustomerInterests(userId: string) {
  const customers = await prisma.customer.findMany({
    where: { userId },
    include: {
      interests: true,
    },
  });

  return customers
    .filter((c) => c.interests !== null)
    .map((c) => ({
      customerId: c.id,
      customerName: `${c.firstName} ${c.lastName}`,
      interests: c.interests,
    }));
}

export async function getSeasonalPredictions(userId: string) {
  const [products, sales, customers, customerInterests] = await Promise.all([
    prisma.product.findMany(),
    prisma.sale.findMany({
      where: { customer: { userId } },
      include: { items: true },
    }),
    prisma.customer.findMany({
      where: { userId },
    }),
    prisma.customerInterest.findMany({
      where: {
        customer: { userId },
      },
    }),
  ]);

  const mappedProducts = products.map((p) => ({
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
  }));

  return generateSeasonalPredictions(
    mappedProducts,
    sales.map((s) => {
      const saleProducts = s.items
        .map((item) => mappedProducts.find((p) => p.id === item.productId))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      return {
        id: s.id,
        customerId: s.customerId,
        customerName: s.customerName ?? undefined,
        amount: s.amount,
        date: s.date.toISOString(),
        month: s.month,
        year: s.year,
        items: s.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        products: saleProducts,
      };
    }),
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
    customerInterests.map((ci) => ({
      ...ci,
      productTypes: ci.productTypes as any,
      colors: ci.colors as any,
      quality: ci.quality as any,
      priceRange: ci.priceRange as any,
    }))
  );
}

export async function generatePredictions(userId: string) {
  // This will trigger a full prediction generation
  const predictions = await getSeasonalPredictions(userId);

  // Save predictions to database
  const savedPredictions = await Promise.all(
    predictions.map((pred) =>
      prisma.seasonalPrediction.create({
        data: {
          productId: pred.productId,
          productName: pred.productName,
          season: pred.season,
          predictedSales: pred.predictedSales,
          recommendationDate: new Date(pred.recommendationDate),
          reason: pred.reason,
          priority: pred.priority,
          status: pred.status,
          confidence: pred.confidence,
        },
      })
    )
  );

  return savedPredictions;
}
