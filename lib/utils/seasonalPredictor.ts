import { Customer, Product, Sale, SeasonalPrediction, CustomerInterest } from '@/types';

/**
 * تشخیص فصل بر اساس تاریخ
 */
export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

/**
 * محاسبه تاریخ پیشنهاد خرید (1 ماه قبل از شروع فصل)
 */
export function calculateRecommendationDate(targetSeason: string): Date {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  let targetMonth = 0;
  
  switch (targetSeason) {
    case 'spring':
      targetMonth = 3; // اسفند برای پیشنهاد
      break;
    case 'summer':
      targetMonth = 6; // خرداد برای پیشنهاد
      break;
    case 'fall':
      targetMonth = 9; // شهریور برای پیشنهاد
      break;
    case 'winter':
      targetMonth = 12; // آذر برای پیشنهاد
      break;
  }
  
  const recommendationDate = new Date(now.getFullYear(), targetMonth - 1, 1);
  
  // اگر فصل گذشته، پیشنهاد برای سال بعد
  if (currentMonth > targetMonth) {
    recommendationDate.setFullYear(now.getFullYear() + 1);
  }
  
  // یک ماه قبل از شروع فصل
  recommendationDate.setMonth(recommendationDate.getMonth() - 1);
  
  return recommendationDate;
}

/**
 * تحلیل محصولات فصلی بر اساس دسته‌بندی
 */
export function getSeasonalProducts(products: Product[]): Map<string, Product[]> {
  const seasonalMap = new Map<string, Product[]>();
  
  products.forEach((product) => {
    const category = product.category?.toLowerCase() || '';
    
    // تعیین فصل مناسب برای هر دسته (برای لوازم بچه و سیسمونی)
    // محصولات زمستانی
    if (category.includes('پتو') || category.includes('رختخواب') || category.includes('روتختی') || 
        category.includes('لباس') && (category.includes('زمستانی') || category.includes('گرم'))) {
      if (!seasonalMap.has('winter')) {
        seasonalMap.set('winter', []);
      }
      seasonalMap.get('winter')!.push(product);
    }
    
    // محصولات تابستانی
    if (category.includes('لباس') && (category.includes('تابستانی') || category.includes('خنک')) ||
        category.includes('کالسکه') || category.includes('کریر')) {
      if (!seasonalMap.has('summer')) {
        seasonalMap.set('summer', []);
      }
      seasonalMap.get('summer')!.push(product);
    }
    
    // محصولات بهاره (سیسمونی و لوازم نوزاد تازه متولد)
    if (category.includes('سیسمونی') || category.includes('لوازم تغذیه') || 
        category.includes('لوازم بهداشتی')) {
      if (!seasonalMap.has('spring')) {
        seasonalMap.set('spring', []);
      }
      seasonalMap.get('spring')!.push(product);
    }
    
    // محصولات پاییزی (آماده‌سازی برای زمستان)
    if (category.includes('رختخواب') || category.includes('پتو')) {
      if (!seasonalMap.has('fall')) {
        seasonalMap.set('fall', []);
      }
      seasonalMap.get('fall')!.push(product);
    }
    
    // محصولات عمومی که می‌توانند در همه فصل‌ها باشند
    if (!seasonalMap.has('all')) {
      seasonalMap.set('all', []);
    }
    seasonalMap.get('all')!.push(product);
  });
  
  return seasonalMap;
}

/**
 * تحلیل فروش فصلی محصولات
 */
export function analyzeSeasonalSales(
  sales: Sale[],
  products: Product[],
  targetSeason: string
): Map<string, number> {
  const seasonalSales = new Map<string, number>();
  
  // تبدیل نام فصل به ماه‌ها
  const seasonMonths: number[] = [];
  switch (targetSeason) {
    case 'spring':
      seasonMonths.push(3, 4, 5); // فروردین، اردیبهشت، خرداد
      break;
    case 'summer':
      seasonMonths.push(6, 7, 8); // تیر، مرداد، شهریور
      break;
    case 'fall':
      seasonMonths.push(9, 10, 11); // مهر، آبان، آذر
      break;
    case 'winter':
      seasonMonths.push(12, 1, 2); // دی، بهمن، اسفند
      break;
  }
  
  sales.forEach((sale) => {
    if (seasonMonths.includes(sale.month)) {
      sale.items?.forEach((item) => {
        const currentSales = seasonalSales.get(item.productId) || 0;
        seasonalSales.set(item.productId, currentSales + item.quantity);
      });
    }
  });
  
  return seasonalSales;
}

/**
 * تحلیل علاقه‌مندی مشتریان به محصولات فصلی
 */
export function analyzeCustomerInterestsForSeason(
  customers: Customer[],
  customerInterests: CustomerInterest[],
  products: Product[],
  targetSeason: string
): Map<string, number> {
  const interestScores = new Map<string, number>();
  const seasonalProducts = getSeasonalProducts(products);
  const seasonProducts = seasonalProducts.get(targetSeason) || [];
  
  customers.forEach((customer) => {
    const interest = customerInterests.find((ci) => ci.customerId === customer.id);
    if (!interest) return;
    
    seasonProducts.forEach((product) => {
      // بررسی علاقه به دسته محصول
      const categoryInterest = interest.productTypes.find(
        (pt) => pt.type === product.category
      );
      
      if (categoryInterest) {
        const currentScore = interestScores.get(product.id) || 0;
        interestScores.set(product.id, currentScore + categoryInterest.score);
      }
    });
  });
  
  return interestScores;
}

/**
 * تولید پیش‌بینی فصلی
 */
export function generateSeasonalPredictions(
  products: Product[],
  sales: Sale[],
  customers: Customer[],
  customerInterests: CustomerInterest[]
): SeasonalPrediction[] {
  const predictions: SeasonalPrediction[] = [];
  const currentSeason = getCurrentSeason();
  const seasonalProducts = getSeasonalProducts(products);
  
  // برای 3 ماه آینده، فصل‌های بعدی را بررسی می‌کنیم
  const nextSeasons = getNextSeasons(currentSeason, 3);
  
  nextSeasons.forEach((targetSeason) => {
    const seasonProducts = seasonalProducts.get(targetSeason) || [];
    
    if (seasonProducts.length === 0) return;
    
    // تحلیل فروش فصلی
    const seasonalSales = analyzeSeasonalSales(sales, products, targetSeason);
    
    // تحلیل علاقه‌مندی مشتریان
    const customerInterestsMap = analyzeCustomerInterestsForSeason(
      customers,
      customerInterests,
      products,
      targetSeason
    );
    
    seasonProducts.forEach((product) => {
      const historicalSales = seasonalSales.get(product.id) || 0;
      const customerInterest = customerInterestsMap.get(product.id) || 0;
      
      // محاسبه امتیاز پیش‌بینی
      const salesScore = historicalSales * 0.6; // 60% وزن برای فروش تاریخی
      const interestScore = customerInterest * 0.4; // 40% وزن برای علاقه مشتریان
      const totalScore = salesScore + interestScore;
      
      if (totalScore > 0) {
        // محاسبه پیش‌بینی فروش (بر اساس فروش تاریخی و علاقه)
        const predictedSales = Math.round(
          historicalSales * 1.1 + customerInterest * 2
        );
        
        const recommendationDate = calculateRecommendationDate(targetSeason);
        const daysUntilRecommendation = Math.ceil(
          (recommendationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // فقط پیشنهادهایی که در 3 ماه آینده هستند
        if (daysUntilRecommendation >= 0 && daysUntilRecommendation <= 90) {
          const priority = totalScore > 10 ? 'high' : totalScore > 5 ? 'medium' : 'low';
          
          const reason = `فروش تاریخی: ${historicalSales} واحد در فصل ${targetSeason}. ` +
            `علاقه مشتریان: ${customerInterest.toFixed(1)} امتیاز. ` +
            `بر اساس تحلیل داده‌های ${customers.length} مشتری و ${sales.length} فروش گذشته.`;
          
          predictions.push({
            id: `pred-${targetSeason}-${product.id}`,
            productId: product.id,
            productName: product.name,
            season: targetSeason as 'spring' | 'summer' | 'fall' | 'winter',
            recommendationDate: recommendationDate.toISOString(),
            predictedSales,
            priority,
            reason,
            status: 'pending',
            confidence: Math.min(100, Math.round(totalScore * 10)),
          });
        }
      }
    });
  });
  
  // مرتب‌سازی بر اساس اولویت و امتیاز
  return predictions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return (b.confidence || 0) - (a.confidence || 0);
  });
}

/**
 * دریافت فصل‌های بعدی
 */
function getNextSeasons(currentSeason: string, monthsAhead: number): string[] {
  const seasons: string[] = ['spring', 'summer', 'fall', 'winter'];
  const currentIndex = seasons.indexOf(currentSeason);
  const nextSeasons: string[] = [];
  
  for (let i = 1; i <= Math.ceil(monthsAhead / 3); i++) {
    const nextIndex = (currentIndex + i) % 4;
    if (!nextSeasons.includes(seasons[nextIndex])) {
      nextSeasons.push(seasons[nextIndex]);
    }
  }
  
  return nextSeasons;
}
