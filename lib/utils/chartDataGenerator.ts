import { GoldPriceHistory } from '@/types';

/**
 * تبدیل تاریخچه قیمت به داده‌های نمودار روزانه
 */
export function getDailyChartData(history: GoldPriceHistory[]): { date: string; price: number }[] {
  if (!history || history.length === 0) return [];
  
  // آخرین 30 روز
  const last30Days = history.slice(-30);
  
  return last30Days.map((item) => ({
    date: new Date(item.date).toLocaleDateString('fa-IR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    price: item.price,
  }));
}

/**
 * تبدیل تاریخچه قیمت به داده‌های نمودار هفتگی
 */
export function getWeeklyChartData(history: GoldPriceHistory[]): { date: string; price: number; avg: number }[] {
  if (!history || history.length === 0) return [];
  
  const weeklyData: { date: string; prices: number[] }[] = [];
  const last12Weeks = history.slice(-84); // 12 هفته = 84 روز
  
  // گروه‌بندی بر اساس هفته
  last12Weeks.forEach((item) => {
    const date = new Date(item.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const existingWeek = weeklyData.find((w) => w.date === weekKey);
    if (existingWeek) {
      existingWeek.prices.push(item.price);
    } else {
      weeklyData.push({
        date: weekKey,
        prices: [item.price],
      });
    }
  });
  
  return weeklyData.map((week) => ({
    date: new Date(week.date).toLocaleDateString('fa-IR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    price: Math.max(...week.prices),
    avg: Math.round(week.prices.reduce((sum, p) => sum + p, 0) / week.prices.length),
  }));
}

/**
 * تبدیل تاریخچه قیمت به داده‌های نمودار ماهانه
 */
export function getMonthlyChartData(history: GoldPriceHistory[]): { date: string; price: number; avg: number }[] {
  if (!history || history.length === 0) return [];
  
  const monthlyData: { date: string; prices: number[] }[] = [];
  
  // گروه‌بندی بر اساس ماه
  history.forEach((item) => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    const existingMonth = monthlyData.find((m) => m.date === monthKey);
    if (existingMonth) {
      existingMonth.prices.push(item.price);
    } else {
      monthlyData.push({
        date: monthKey,
        prices: [item.price],
      });
    }
  });
  
  return monthlyData.map((month) => ({
    date: new Date(month.date + '-01').toLocaleDateString('fa-IR', { 
      year: 'numeric',
      month: 'long' 
    }),
    price: Math.max(...month.prices),
    avg: Math.round(month.prices.reduce((sum, p) => sum + p, 0) / month.prices.length),
  })).slice(-12); // آخرین 12 ماه
}

/**
 * تبدیل تاریخچه قیمت به داده‌های نمودار سالانه
 */
export function getYearlyChartData(history: GoldPriceHistory[]): { date: string; price: number; avg: number }[] {
  if (!history || history.length === 0) return [];
  
  const yearlyData: { date: string; prices: number[] }[] = [];
  
  // گروه‌بندی بر اساس سال
  history.forEach((item) => {
    const date = new Date(item.date);
    const yearKey = date.getFullYear().toString();
    
    const existingYear = yearlyData.find((y) => y.date === yearKey);
    if (existingYear) {
      existingYear.prices.push(item.price);
    } else {
      yearlyData.push({
        date: yearKey,
        prices: [item.price],
      });
    }
  });
  
  return yearlyData.map((year) => ({
    date: year.date,
    price: Math.max(...year.prices),
    avg: Math.round(year.prices.reduce((sum, p) => sum + p, 0) / year.prices.length),
  }));
}
