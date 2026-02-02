import { prisma } from '../db/prisma';

export interface CreateProductData {
  name: string;
  color?: string;
  originalPrice: number;
  discountedPrice?: number;
  finalPrice: number;
  category?: string;
  stock?: number;
  description?: string;
  images?: string[];
  slug?: string;
  priceType?: 'fixed' | 'call_for_price' | 'negotiable';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductData {
  name?: string;
  color?: string;
  originalPrice?: number;
  discountedPrice?: number;
  finalPrice?: number;
  category?: string;
  stock?: number;
  description?: string;
  images?: string[];
  slug?: string;
  priceType?: 'fixed' | 'call_for_price' | 'negotiable';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export async function getProducts(filters?: {
  search?: string;
  category?: string;
}) {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { category: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  return prisma.product.findMany({
    where,
    include: {
      saleItems: true,
      inventoryItems: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      saleItems: {
        include: { sale: true },
      },
      inventoryItems: true,
      priceChanges: {
        orderBy: { date: 'desc' },
        take: 20,
      },
    },
  });
}

export async function createProduct(data: CreateProductData) {
  // Generate slug if not provided
  let slug = data.slug;
  if (!slug && data.name) {
    const { generateSlug } = await import('../utils/slug');
    slug = generateSlug(data.name);
    
    // Check if slug exists
    const existing = await prisma.product.findUnique({
      where: { slug },
    });
    
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  return prisma.product.create({
    data: {
      ...data,
      slug,
      priceType: data.priceType || 'fixed',
    },
  });
}

export async function updateProduct(id: string, data: UpdateProductData) {
  // If price changed, create a price change record
  if (data.finalPrice !== undefined) {
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (existing && data.finalPrice !== existing.finalPrice) {
      await prisma.priceChange.create({
        data: {
          productId: id,
          date: new Date(),
          price: data.finalPrice,
          reason: 'manual',
        },
      });
    }
  }

  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

export async function getBestSellingProducts(limit: number = 10) {
  const products = await prisma.product.findMany({
    include: {
      saleItems: true,
    },
  });

  // Calculate total sales for each product
  const productSales = products.map((product) => {
    const totalSales = product.saleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return {
      ...product,
      totalSales,
    };
  });

  // Sort by total sales and return top products
  return productSales
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit)
    .map(({ totalSales, ...product }) => product);
}

/**
 * Update product prices based on gold price increase
 * Only updates if new gold price is higher than yearly highest
 */
export async function updateProductPricesBasedOnGold(
  userId: string,
  increasePercent: number = 100 // 100% means full increase based on gold price change
): Promise<{ updated: number; skipped: number }> {
  // Get current gold price
  const goldPrice = await prisma.goldPrice.findFirst({
    orderBy: { lastUpdate: 'desc' },
  });

  if (!goldPrice || !goldPrice.yearlyHighest) {
    throw new Error('Gold price not found or yearly highest not set');
  }

  // Import pricing logic
  const { shouldUpdateProductPrice, calculateNewProductPrice } = await import('../utils/goldPriceManager');

  // Get all products
  const products = await prisma.product.findMany({
    where: {
      // You can add user filtering here if needed
    },
  });

  let updated = 0;
  let skipped = 0;

  // Check if we should update prices (only if current price > yearly highest)
  const shouldUpdate = shouldUpdateProductPrice(
    goldPrice.price,
    goldPrice.yearlyHighest,
    increasePercent
  );

  if (!shouldUpdate) {
    return { updated: 0, skipped: products.length };
  }

  // Update each product
  for (const product of products) {
    const newPrice = calculateNewProductPrice(
      product.finalPrice,
      goldPrice.price,
      goldPrice.yearlyHighest,
      increasePercent
    );

    // Only update if price actually changed
    if (newPrice !== product.finalPrice && newPrice > product.finalPrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          finalPrice: newPrice,
        },
      });

      // Create price change record
      await prisma.priceChange.create({
        data: {
          productId: product.id,
          date: new Date(),
          price: newPrice,
          reason: 'gold_price_increase',
        },
      });

      updated++;
    } else {
      skipped++;
    }
  }

  return { updated, skipped };
}
