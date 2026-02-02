import { Sale, Inventory, Product, Debt } from '@/types';

/**
 * تولید داده‌های نمودار فروش ماهانه (12 ماه گذشته)
 */
export function getMonthlySalesChartData(sales: Sale[]): { month: string; sales: number }[] {
  const monthlyData = new Map<string, number>();
  const currentDate = new Date();
  
  // برای 12 ماه گذشته
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthlyData.set(monthKey, 0);
  }
  
  // محاسبه فروش هر ماه
  sales.forEach((sale) => {
    const monthKey = `${sale.year}-${sale.month}`;
    const current = monthlyData.get(monthKey) || 0;
    monthlyData.set(monthKey, current + sale.amount);
  });
  
  // تبدیل به آرایه با نام ماه‌های فارسی
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  return Array.from(monthlyData.entries()).map(([key, sales]) => {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return {
      month: `${monthNames[month - 1]} ${year}`,
      sales,
    };
  });
}

/**
 * تولید داده‌های نمودار مقایسه‌ای فروش (ماه جاری vs ماه قبل)
 */
export function getSalesComparisonChartData(
  sales: Sale[],
  currentMonth: number,
  currentYear: number,
  previousMonth: number,
  previousYear: number
): { period: string; sales: number }[] {
  const currentSales = sales
    .filter((s) => s.month === currentMonth && s.year === currentYear)
    .reduce((sum, s) => sum + s.amount, 0);
    
  const previousSales = sales
    .filter((s) => s.month === previousMonth && s.year === previousYear)
    .reduce((sum, s) => sum + s.amount, 0);
  
  return [
    { period: 'ماه قبل', sales: previousSales },
    { period: 'ماه جاری', sales: currentSales },
  ];
}

/**
 * تولید داده‌های نمودار روند سرمایه در گردش (12 ماه گذشته)
 */
export function getWorkingCapitalTrendData(
  sales: Sale[],
  inventory: Inventory[],
  products: Product[],
  debts: Debt[]
): { month: string; capital: number }[] {
  const monthlyCapital = new Map<string, number>();
  const currentDate = new Date();
  
  // برای 12 ماه گذشته
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    // محاسبه سرمایه در گردش برای این ماه
    // شامل: فروش‌های ماه + موجودی (بر اساس قیمت ماه) + طلب‌های ماه
    const monthSales = sales
      .filter((s) => s.year === date.getFullYear() && s.month === date.getMonth() + 1)
      .reduce((sum, s) => sum + s.amount, 0);
    
    // موجودی (ساده شده - در واقعیت باید بر اساس تاریخ باشد)
    const inventoryValue = inventory.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.finalPrice * item.quantity : 0);
    }, 0);
    
    // طلب‌های ماه
    const monthDebts = debts
      .filter((d) => {
        const debtDate = new Date(d.dueDate);
        return debtDate.getFullYear() === date.getFullYear() && 
               debtDate.getMonth() + 1 === date.getMonth() + 1 &&
               d.status === 'pending';
      })
      .reduce((sum, d) => sum + d.amount, 0);
    
    monthlyCapital.set(monthKey, monthSales + inventoryValue * 0.3 + monthDebts);
  }
  
  // تبدیل به آرایه با نام ماه‌های فارسی
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  return Array.from(monthlyCapital.entries()).map(([key, capital]) => {
    const [year, month] = key.split('-').map(Number);
    return {
      month: `${monthNames[month - 1]} ${year}`,
      capital,
    };
  });
}

/**
 * تولید داده‌های نمودار موجودی محصولات (10 محصول برتر از نظر ارزش)
 */
export function getTopInventoryChartData(
  inventory: Inventory[],
  products: Product[]
): { product: string; value: number; quantity: number }[] {
  const inventoryData = inventory.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const value = product ? product.finalPrice * item.quantity : 0;
    return {
      product: item.productName,
      value,
      quantity: item.quantity,
    };
  });
  
  // مرتب‌سازی بر اساس ارزش و انتخاب 10 محصول برتر
  return inventoryData
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
