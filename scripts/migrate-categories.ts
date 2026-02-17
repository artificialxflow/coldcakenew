import { PrismaClient } from '@prisma/client';
import { generateSlug } from '../lib/utils/slug';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting category migration...');

  // Get all unique category values from products
  const products = await prisma.product.findMany({
    where: {
      category: { not: null },
    },
    select: {
      id: true,
      category: true,
    },
  });

  // Extract unique categories
  const uniqueCategories = new Set<string>();
  products.forEach((p) => {
    if (p.category && p.category.trim()) {
      uniqueCategories.add(p.category.trim());
    }
  });

  console.log(`📦 Found ${uniqueCategories.size} unique categories from ${products.length} products`);

  // Create Category records
  const categoryMap = new Map<string, string>(); // category name -> category id
  let order = 0;

  for (const categoryName of Array.from(uniqueCategories).sort()) {
    try {
      const slug = generateSlug(categoryName);
      
      // Check if category with this name or slug already exists
      const existing = await prisma.category.findFirst({
        where: {
          OR: [
            { name: categoryName },
            { slug: slug },
          ],
        },
      });

      if (existing) {
        console.log(`ℹ️  Category "${categoryName}" already exists, using existing`);
        categoryMap.set(categoryName, existing.id);
        continue;
      }

      // Create new category
      const category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: slug,
          order: order++,
          active: true,
        },
      });

      categoryMap.set(categoryName, category.id);
      console.log(`✅ Created category: ${categoryName} (${category.id})`);
    } catch (error) {
      console.error(`❌ Error creating category "${categoryName}":`, error);
    }
  }

  // Update products with categoryId
  console.log('\n🔄 Updating products with categoryId...');
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (!product.category) {
      skipped++;
      continue;
    }

    const categoryId = categoryMap.get(product.category.trim());
    if (!categoryId) {
      console.warn(`⚠️  No category ID found for "${product.category}"`);
      skipped++;
      continue;
    }

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId },
      });
      updated++;
    } catch (error) {
      console.error(`❌ Error updating product ${product.id}:`, error);
      skipped++;
    }
  }

  console.log(`\n✅ Migration completed!`);
  console.log(`   - Created/Found ${categoryMap.size} categories`);
  console.log(`   - Updated ${updated} products`);
  console.log(`   - Skipped ${skipped} products`);
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
