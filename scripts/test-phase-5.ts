
import { prisma } from '../lib/db/prisma';
import { updateGoldPrice, getCurrentGoldPrice } from '../lib/services/gold-price.service';
import { createScrapeTarget, runScrape, getScrapeTargets } from '../lib/services/maps-scraper.service';
import { createBlogPost, getBlogPostBySlug, deleteBlogPost } from '../lib/services/blog.service';

async function main() {
    console.log('🚀 Starting Phase 5 Verification (Special Features)...');

    // 1. Gold Price Tests
    console.log('\n--- Testing Gold Price Service ---');

    // Set initial price
    await updateGoldPrice({ price: 10000000, change: 0, changePercent: 0 });

    // Update price (Higher) -> Trend UP
    const goldUpdate = await updateGoldPrice({ price: 10500000, change: 500000, changePercent: 5 });
    console.log(`✅ Gold Price Updated: ${goldUpdate.price} | Trend: ${goldUpdate.trend}`);

    if (goldUpdate.trend === 'up') {
        console.log('✅ Trend calculation verified (UP)');
    } else {
        console.error(`❌ Trend calculation failed. Expected 'up', got '${goldUpdate.trend}'`);
    }

    // Check History
    const current = await getCurrentGoldPrice();
    if (current && current.history.length >= 2) {
        console.log(`✅ History verified. Count: ${current.history.length}`);
    } else {
        console.warn('⚠️ History count low (might be first run)');
    }

    // 2. Maps Scraper Tests
    console.log('\n--- Testing Maps Scraper Service ---');

    const target = await createScrapeTarget({
        keyword: 'Test Shop',
        city: 'Test City',
        priority: 'medium'
    });
    console.log(`✅ Scrape Target Created: ${target.id}`);

    // Run Scrape (Simulation)
    console.log('Running scrape simulation...');
    const run = await runScrape(target.id);
    console.log(`✅ Scrape Run Status: ${run.status}`);

    // Verify completion
    const updatedTarget = (await getScrapeTargets()).find(t => t.id === target.id);
    if (updatedTarget?.status === 'completed') {
        console.log('✅ Target status updated to completed');
    } else {
        console.error(`❌ Target status mismatch. Expected 'completed', got '${updatedTarget?.status}'`);
    }

    // 3. Blog Tests
    console.log('\n--- Testing Blog Service ---');

    const blogTitle = `Test Blog Post ${Date.now()}`;
    const post = await createBlogPost({
        title: blogTitle,
        content: 'This is a test content.',
        category: 'Testing',
        published: true
    });
    console.log(`✅ Blog Post Created: ${post.slug}`);

    // Duplicate Slug Test
    const postDuplicate = await createBlogPost({
        title: blogTitle, // Same title
        content: 'Duplicate content',
        published: true
    });
    console.log(`✅ Duplicate Title Post Created: ${postDuplicate.slug}`);

    if (postDuplicate.slug !== post.slug) {
        console.log('✅ Unique Slug Generation verified');
    } else {
        console.error('❌ Slug uniqueness failed');
    }

    // 4. Cleanup
    console.log('\n--- Cleanup ---');
    await deleteBlogPost(post.id);
    await deleteBlogPost(postDuplicate.id);
    // Scraper data cleanup
    await prisma.mapsScrapeRun.deleteMany({ where: { targetId: target.id } });
    await prisma.mapsScrapeTarget.delete({ where: { id: target.id } });

    console.log('✅ Cleanup done');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
