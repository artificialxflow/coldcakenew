import { prisma } from '../db/prisma';
import {
  updateYearlyHighest,
  getPriceTrend,
} from '../utils/goldPriceManager';

export async function getCurrentGoldPrice() {
  return prisma.goldPrice.findFirst({
    orderBy: { lastUpdate: 'desc' },
    include: {
      history: {
        orderBy: { date: 'desc' },
        take: 100,
      },
    },
  });
}

export async function updateGoldPrice(data: {
  price: number;
  change: number;
  changePercent: number;
}) {
  const existing = await prisma.goldPrice.findFirst({
    orderBy: { lastUpdate: 'desc' },
  });

  let trend: 'up' | 'down' | 'stable' = 'stable';
  let yearlyHighest = data.price;
  let yearlyHighestDate = new Date();

  if (existing) {
    trend = getPriceTrend(data.price, existing.price);
    const highestUpdate = updateYearlyHighest(data.price, existing.yearlyHighest);
    yearlyHighest = highestUpdate.newHighest;
    if (highestUpdate.updated) {
      yearlyHighestDate = new Date();
    } else {
      yearlyHighestDate = existing.yearlyHighestDate;
    }
  }

  // Create new gold price entry
  const goldPrice = await prisma.goldPrice.create({
    data: {
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      lastUpdate: new Date(),
      trend,
      yearlyHighest,
      yearlyHighestDate,
    },
  });

  // Add to history
  await prisma.goldPriceHistory.create({
    data: {
      goldPriceId: goldPrice.id,
      date: new Date(),
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
    },
  });

  return goldPrice;
}

export async function getGoldPriceHistory(limit: number = 100) {
  return prisma.goldPriceHistory.findMany({
    orderBy: { date: 'desc' },
    take: limit,
  });
}
