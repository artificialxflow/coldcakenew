import { prisma } from '../db/prisma';

export interface CreateScrapeTargetData {
  keyword: string;
  city: string;
  radius?: number;
  radiusType?: 'km' | 'city';
  priority: 'high' | 'medium' | 'low';
}

export async function getScrapeTargets() {
  return prisma.mapsScrapeTarget.findMany({
    include: {
      businesses: {
        take: 10,
        orderBy: { scrapedAt: 'desc' },
      },
      runs: {
        take: 5,
        orderBy: { startedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createScrapeTarget(data: CreateScrapeTargetData) {
  return prisma.mapsScrapeTarget.create({
    data: {
      ...data,
      status: 'pending',
    },
  });
}

export async function runScrape(targetId: string) {
  const target = await prisma.mapsScrapeTarget.findUnique({
    where: { id: targetId },
  });

  if (!target) {
    throw new Error('Scrape target not found');
  }

  // Create run record
  const run = await prisma.mapsScrapeRun.create({
    data: {
      targetId,
      startedAt: new Date(),
      status: 'running',
      totalFound: 0,
      businessesScraped: [],
      progress: 0,
    },
  });

  // Update target status
  await prisma.mapsScrapeTarget.update({
    where: { id: targetId },
    data: { status: 'running' },
  });

  // TODO: Actually perform scraping (this would call external service or use Google Maps API)
  // For now, just simulate
  try {
    // Simulate scraping
    const businesses = []; // Would be populated from actual scraping
    
    await prisma.mapsScrapeRun.update({
      where: { id: run.id },
      data: {
        completedAt: new Date(),
        status: 'completed',
        totalFound: businesses.length,
        progress: 100,
      },
    });

    await prisma.mapsScrapeTarget.update({
      where: { id: targetId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalFound: businesses.length,
      },
    });

    return run;
  } catch (error) {
    await prisma.mapsScrapeRun.update({
      where: { id: run.id },
      data: {
        completedAt: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    await prisma.mapsScrapeTarget.update({
      where: { id: targetId },
      data: { status: 'failed' },
    });

    throw error;
  }
}

export async function getScrapedBusinesses(targetId?: string) {
  const where: any = {};
  if (targetId) {
    where.scrapeTargetId = targetId;
  }

  return prisma.scrapedBusiness.findMany({
    where,
    include: {
      target: true,
    },
    orderBy: { scrapedAt: 'desc' },
  });
}
