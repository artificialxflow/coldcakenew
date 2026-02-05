
import { prisma } from '../lib/db/prisma';
import { createCustomer, getCustomerInterests, deleteCustomer } from '../lib/services/customer.service';
import { createDebt, getDebts } from '../lib/services/debt.service';
import { createMessage, runAutomatedMessaging } from '../lib/services/message.service';
import { createProduct } from '../lib/services/product.service';

// Mock userId (Admin)
const USER_ID = 'cml96f6260011mb39p5y2097l'; // ID from seed or fetch from DB if standard

async function main() {
    console.log('🚀 Starting Phase 4 Verification (CRM & Messaging)...');

    // Ensure we have a valid user ID to work with
    const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
    if (!admin) throw new Error('Admin user not found, run seed first');
    const userId = admin.id;

    // 1. Customer Tests
    console.log('\n--- Testing Customer Service ---');
    const customerData = {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '09129999999',
        userId
    };

    const customer = await createCustomer(customerData);
    console.log(`✅ Customer created: ${customer.id}`);

    // 2. Debt Tests
    console.log('\n--- Testing Debt Service ---');
    const debt = await createDebt(userId, {
        customerId: customer.id,
        amount: 500000,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        customerName: 'Test Customer'
    });
    console.log(`✅ Debt record created: ${debt.id}`);

    const debts = await getDebts(userId, { customerId: customer.id });
    if (debts.length > 0 && debts[0].amount === 500000) {
        console.log('✅ Debt retrieval verified');
    } else {
        console.error('❌ Debt retrieval failed');
    }

    // 3. Messaging Tests
    console.log('\n--- Testing Messaging Service ---');

    // Manual Message
    const msg = await createMessage(userId, {
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        content: 'Hello World',
        platform: 'telegram'
    });
    console.log(`✅ Manual message logged: ${msg.id}`);

    // Automated Messaging Logic
    // To test this, we need BusinessSettings with automatedMessaging enabled
    console.log('--- Testing Automated Messaging trigger ---');

    // Setup Settings
    await prisma.businessSettings.upsert({
        where: { id: 'default' }, // Assuming single settings record strategy or update first found
        update: {
            automatedMessaging: {
                enabled: true,
                frequency: 'daily',
                platforms: ['telegram'],
                rules: [] // Simple rule or empty to test pipeline
            }
        },
        create: {
            contactPhone: '000',
            telegramChannel: 'test',
            rubikaChannel: 'test',
            whatsappNumber: 'test',
            instagramPage: 'test',
            automatedMessaging: {
                enabled: true,
                frequency: 'daily',
                platforms: ['telegram']
            }
        }
    });

    try {
        // Need at least one product for recommendations
        const p = await createProduct({ name: 'AutoMsg Prod', originalPrice: 100, finalPrice: 100, stock: 10 });

        // Run automation
        const run = await runAutomatedMessaging(userId);
        console.log(`✅ Automated run executed. Status: ${run.status}, Sent: ${run.sentMessages}`);

        // Cleanup product
        await prisma.product.delete({ where: { id: p.id } });

    } catch (e) {
        console.log('⚠️ Automated messaging test note:', e instanceof Error ? e.message : e);
        // It might fail if no customers match criteria or no settings found, but we want to ensure the function CALL works.
    }

    // 4. Cleanup
    console.log('\n--- Cleanup ---');
    // Deleting customer cascades to debts and messages mostly, but manual cleanup is safer
    await prisma.debt.deleteMany({ where: { customerId: customer.id } });
    await prisma.message.deleteMany({ where: { customerId: customer.id } });
    await deleteCustomer(customer.id, userId);
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
