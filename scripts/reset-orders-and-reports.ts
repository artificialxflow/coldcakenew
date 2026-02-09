import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Resetting orders & reports data (keeping products, users, roles)...");

  // مهم: ترتیب حذف‌ها طوری است که وابستگی‌های کلید خارجی رعایت شود.

  // فروشگاه / سبد و سفارشات
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.order.deleteMany({});

  // گزارش‌های فروش داخلی
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});

  // بدهی‌ها
  await prisma.debt.deleteMany({});

  // حساب بانکی و تراکنش‌ها
  await prisma.bankTransaction.deleteMany({});
  await prisma.bankAccount.deleteMany({});

  // قیمت طلا و تاریخچه‌اش (نمودارها از صفر شروع می‌شود)
  await prisma.goldPriceHistory.deleteMany({});
  await prisma.goldPrice.deleteMany({});

  console.log("✅ Done. Orders, carts, sales, debts, bank data and gold prices have been cleared.");
  console.log("ℹ️ Products, inventory, users, roles, permissions and OTP bypass user are untouched.");
}

main()
  .catch((e) => {
    console.error("❌ Error while resetting orders & reports data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

