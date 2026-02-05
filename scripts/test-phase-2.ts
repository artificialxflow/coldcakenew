
import { prisma } from '../lib/db/prisma';
import { createProduct, updateProduct, deleteProduct, getProductById } from '../lib/services/product.service';
import { calculateNewProductPrice } from '../lib/utils/goldPriceManager';

async function main() {
  console.log('🚀 Starting Phase 2 Verification...');

  // 1. Product CRUD
  console.log('\n--- Testing Product CRUD ---');
  const testProductName = `Test Product ${Date.now()}`;
  
  // Create
  console.log(`Creating product: ${testProductName}`);
  const product = await createProduct({
    name: testProductName,
    originalPrice: 100000,
    finalPrice: 100000,
    priceType: 'fixed',
    category: 'test_category',
    stock: 10,
    description: 'Automated test product'
  });
  console.log(`✅ Product created with ID: ${product.id}`);

  // Read
  const fetched = await getProductById(product.id);
  if (fetched?.name === testProductName) {
    console.log('✅ Product fetch verified');
  } else {
    console.error('❌ Product fetch failed');
  }

  // Update
  console.log('Updating product stock to 20...');
  const updated = await updateProduct(product.id, { stock: 20 });
  if (updated.stock === 20) {
    console.log('✅ Product update verified');
  } else {
    console.error('❌ Product update failed');
  }

  // 2. Pricing Logic Unit Test
  console.log('\n--- Testing Gold Price Logic ---');
  const currentPrice = 100000;
  const yearlyHighest = 5000000; // 5 mil
  const newGoldPrice = 6000000;  // 6 mil (20% increase)
  const increasePercent = 100;   // 100% impact

  // Logic: (6m - 5m) / 5m = 0.2 (20% increase)
  // Price Increase = 100,000 * 0.2 * 1 = 20,000
  // New Price should be 120,000
  
  const calculated = calculateNewProductPrice(currentPrice, newGoldPrice, yearlyHighest, increasePercent);
  console.log(`Base Price: ${currentPrice}`);
  console.log(`Old Gold Highest: ${yearlyHighest}`);
  console.log(`New Gold Price: ${newGoldPrice}`);
  console.log(`Calculated New Price: ${calculated}`);

  if (calculated === 120000) {
    console.log('✅ Pricing logic verified');
  } else {
    console.error(`❌ Pricing logic failed. Expected 120000, got ${calculated}`);
  }

  // Cleanup
  console.log('\n--- Cleanup ---');
  await deleteProduct(product.id);
  console.log('✅ Test product deleted');

  console.log('\n🎉 Phase 2 Verification Completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
