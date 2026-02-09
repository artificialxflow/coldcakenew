import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Resetting inventory (stock value) ...");

  // فقط موجودی انبار را خالی می‌کنیم؛ محصولات، کاربران و سایر داده‌ها باقی می‌مانند.
  await prisma.inventory.deleteMany({});

  console.log("✅ Inventory cleared. Working capital and total inventory will be near 0 on dashboard.");
}

main()
  .catch((e) => {
    console.error("❌ Error while resetting inventory:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

