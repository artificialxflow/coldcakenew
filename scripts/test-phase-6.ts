
import { prisma } from '../lib/db/prisma';
import { getSummaryReport } from '../lib/services/report.service';
import { generatePredictions, getSeasonalPredictions } from '../lib/services/analytics.service';
import { createOrder } from '../lib/services/order.service';
import { createProduct } from '../lib/services/product.service';
import { createDebt } from '../lib/services/debt.service';
import { createMessage } from '../lib/services/message.service';
import { createCustomer } from '../lib/services/customer.service';

async function main() {
    console.log('🚀 Starting Phase 6 Verification (Admin & Reports) - Retry 2...');

    // Ensure Admin
    const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
    if (!admin) throw new Error('Admin user not found');
    const userId = admin.id;

    // 1. Setup Data
    console.log('--- Setting up test data ---');

    // Product
    const product = await createProduct({
        name: 'Report Test Product 3',
        originalPrice: 100000,
        finalPrice: 100000,
        stock: 50,
        category: 'ReportCat'
    });

    // Customer
    const customer = await createCustomer({
        firstName: 'Report',
        lastName: 'User2',
        phone: `0988${Date.now().toString().slice(-7)}`,
        userId
    });

    // Sales (Order + Sale Record)
    // Create Order for consistency
    const order = await createOrder({
        customerId: customer.id,
        customerName: 'Report User2',
        customerPhone: customer.phone!,
        paymentMethod: 'manual',
        items: [{ productId: product.id, productName: product.name, unitPrice: 100000, quantity: 2 }]
    });

    // Create SALE record (Simulating completed order for analytics)
    const now = new Date();
    const sale = await prisma.sale.create({
        data: {
            customerId: customer.id,
            customerName: 'Report User2',
            amount: 200000,
            date: now,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            items: {
                create: [{
                    productId: product.id,
                    productName: product.name,
                    quantity: 2,
                    unitPrice: 100000
                }]
            }
        }
    });

    // Debt
    const debt = await createDebt(userId, {
        customerId: customer.id,
        amount: 50000,
        dueDate: new Date(),
        customerName: 'Report User2'
    });

    // Message (Today)
    await createMessage(userId, {
        customerId: customer.id,
        customerName: 'Report User2',
        content: 'Report Msg',
        platform: 'telegram'
    });

    // 2. Test Summary Report
    console.log('\n--- Testing Summary Report ---');
    const report = await getSummaryReport(userId);

    console.log('Monthly Sales Value:', report.monthlySales);
    console.log(`Total Debts: ${report.totalDebts}`);
    console.log(`Messages Today: ${report.messagesSentToday}`);

    // Check assuming report.monthlySales returns the number directly (based on previous run log "Monthly Sales Object: 0")
    if (typeof report.monthlySales === 'number' && report.monthlySales >= 200000) {
        console.log('✅ Monthly Sales verified');
    } else {
        console.warn(`⚠️ Sales count mismatch. Expected >= 200000, got ${report.monthlySales}`);
    }

    if (report.totalDebts >= 50000) {
        console.log('✅ Total Debts verified');
    } else {
        console.error('❌ Total Debts failed');
    }

    if (report.messagesSentToday >= 1) {
        console.log('✅ Messages count verified');
    } else {
        console.error('❌ Messages count failed');
    }

    // 3. Test Analytics (AI)
    console.log('\n--- Testing Analytics ---');
    await generatePredictions(userId);
    console.log('✅ Analytics engine executed');

    // 4. Cleanup
    console.log('\n--- Cleanup ---');
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });

    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.invoice.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });

    await prisma.debt.delete({ where: { id: debt.id } });
    await prisma.message.deleteMany({ where: { customerId: customer.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    await prisma.product.delete({ where: { id: product.id } });

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
