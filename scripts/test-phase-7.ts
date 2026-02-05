
import { prisma } from '../lib/db/prisma';
import { createProduct } from '../lib/services/product.service';
import { addToCart, getCart } from '../lib/services/cart.service';
import { createOrder } from '../lib/services/order.service';
import { createCustomer } from '../lib/services/customer.service';

// Mock User ID generator or use existing
async function getOrCreateUser(username: string) {
    let user = await prisma.user.findFirst({ where: { username } });
    if (!user) {
        // Ensure 'customer' role exists
        let role = await prisma.role.findUnique({ where: { name: 'customer' } });
        if (!role) {
            role = await prisma.role.create({ data: { name: 'customer', description: 'Standard Customer' } });
        }

        user = await prisma.user.create({
            data: {
                username,
                passwordHash: 'mock',
                role: {
                    connect: { id: role.id }
                }
            }
        });
    }
    return user;
}

async function main() {
    console.log('🚀 Starting Phase 7: End-to-End (E2E) Verification...');

    const startTime = Date.now();
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    try {
        // 1. Setup Environment (Product)
        log('\n--- Step 1: Shop Setup ---');
        const product = await createProduct({
            name: `E2E Ring ${Date.now()}`,
            originalPrice: 5000000,
            finalPrice: 5000000,
            stock: 5,
            category: 'Jewelry'
        });
        log(`✅ Product Listed: ${product.name} (Stock: 5)`);

        // 2. User Registration (Simulation)
        log('\n--- Step 2: User Registration ---');
        const username = `user_${Date.now()}`;
        const user = await getOrCreateUser(username);

        // Create Customer Profile linked to User
        const customer = await createCustomer({
            firstName: 'E2E',
            lastName: 'Tester',
            phone: `0900${Date.now().toString().slice(-7)}`,
            userId: user.id
        });
        log(`✅ User Registered: ${username} (Customer ID: ${customer.id})`);

        // 3. Shopping Flow
        log('\n--- Step 3: Shopping Flow ---');
        const sessionId = `session_${user.id}`;

        // Add to Cart
        await addToCart(sessionId, { productId: product.id, quantity: 1 }, customer.id);
        const cart = await getCart(sessionId);

        if (cart && cart.items.length === 1) {
            log('✅ Item added to cart');
        } else {
            throw new Error('Cart check failed');
        }

        // 4. Checkout
        log('\n--- Step 4: Checkout ---');
        const order = await createOrder({
            customerId: customer.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerPhone: customer.phone!,
            paymentMethod: 'online',
            shippingAddress: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone!,
                address: 'Tehran, Test St',
                city: 'Tehran',
                province: 'Tehran'
            },
            // Map items from cart
            items: cart.items.map(item => ({
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.finalPrice
            }))
        });
        log(`✅ Order Placed: ${order.orderNumber}`);

        // 5. Verification
        log('\n--- Step 5: System Verification ---');

        // Check Stock
        const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
        if (updatedProduct?.stock === 4) {
            log('✅ Inventory updated (5 -> 4)');
        } else {
            throw new Error(`Inventory mismatch: ${updatedProduct?.stock}`);
        }

        // Check Invoice
        const invoice = await prisma.invoice.findFirst({ where: { orderId: order.id } });
        if (invoice) {
            log(`✅ Invoice generated: ${invoice.invoiceNumber}`);
        } else {
            throw new Error('Invoice not generated');
        }

        const userOrders = await prisma.order.findMany({ where: { customerId: customer.id } });
        if (userOrders.length > 0) {
            log(`✅ Order visible in user history (${userOrders.length} orders)`);
        } else {
            throw new Error('Order not found in history');
        }

        log('\n🎉 E2E User Journey Completed Successfully!');

        // Cleanup
        log('\n--- Cleanup ---');
        await prisma.invoice.deleteMany({ where: { orderId: order.id } });
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        await prisma.order.delete({ where: { id: order.id } });
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart.delete({ where: { id: cart.id } });
        await prisma.product.delete({ where: { id: product.id } });
        // Keep user/customer for history or dev consistency
        await prisma.customer.delete({ where: { id: customer.id } });
        log('✅ Cleanup done');

    } catch (error) {
        console.error('\n❌ E2E Test Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
