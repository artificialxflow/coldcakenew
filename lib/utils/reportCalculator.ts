import { Sale, Debt, Inventory, Product } from '@/types';

export function calculateMonthlySales(sales: Sale[], month: number, year: number): number {
  return sales
    .filter((sale) => sale.month === month && sale.year === year)
    .reduce((sum, sale) => sum + sale.amount, 0);
}

export function findBestSellingMonth(sales: Sale[]): { month: number; year: number; sales: number } | null {
  if (sales.length === 0) return null;
  
  const monthlySales = new Map<string, number>();
  
  sales.forEach((sale) => {
    const key = `${sale.year}-${sale.month}`;
    monthlySales.set(key, (monthlySales.get(key) || 0) + sale.amount);
  });
  
  if (monthlySales.size === 0) return null;
  
  const best = Array.from(monthlySales.entries())
    .sort((a, b) => b[1] - a[1])[0];
  
  const [year, month] = best[0].split('-').map(Number);
  return { month, year, sales: best[1] };
}

export function calculateWorkingCapital(
  inventory: Inventory[],
  products: Product[],
  debts: Debt[]
): number {
  // سرمایه در گردش = موجودی محصولات + طلب‌های مشتریان
  const inventoryValue = inventory.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.finalPrice * item.quantity : 0);
  }, 0);
  
  const totalDebts = debts
    .filter((debt) => debt.status === 'pending')
    .reduce((sum, debt) => sum + debt.amount, 0);
  
  return inventoryValue + totalDebts;
}

export function getUpcomingDebts(debts: Debt[], days: number = 7): Debt[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return debts
    .filter((debt) => {
      if (debt.status === 'paid') return false;
      const dueDate = new Date(debt.dueDate);
      return dueDate <= futureDate && dueDate >= now;
    })
    .map((debt) => {
      const dueDate = new Date(debt.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...debt,
        daysUntilDue,
      };
    })
    .sort((a, b) => (a.daysUntilDue || 0) - (b.daysUntilDue || 0));
}

export function calculateTotalInventoryValue(
  inventory: Inventory[],
  products: Product[]
): number {
  return inventory.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.finalPrice * item.quantity : 0);
  }, 0);
}

export function calculateTotalDebts(debts: Debt[]): number {
  return debts
    .filter((debt) => debt.status === 'pending')
    .reduce((sum, debt) => sum + debt.amount, 0);
}

export function countUpcomingDebts(debts: Debt[], days: number = 7): number {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return debts.filter((debt) => {
    if (debt.status === 'paid') return false;
    const dueDate = new Date(debt.dueDate);
    return dueDate <= futureDate && dueDate >= now;
  }).length;
}

export function calculateTotalInventoryQuantity(
  inventory: Inventory[]
): number {
  return inventory.reduce((sum, item) => sum + item.quantity, 0);
}
