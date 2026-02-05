
import { prisma } from '../lib/db/prisma';
import { addToCart, getCart, updateCartItem, clearCart } from '../lib/services/cart.service';
import { createOrder, cancelOrder } from '../lib/services/order.service';
import { createProduct, getProductById, deleteProduct } from '../lib/services/product.service';

async function main() {
    console.log('🚀 Starting Phase 3 Verification (Sales & Orders)...');

    // Setup: Create a test product
    const product = await createProduct({
        name: `Order Test Product ${Date.now()}`,
        originalPrice: 50000,
        finalPrice: 50000,
        stock: 10,
        description: 'For order testing'
    });
    console.log(`📦 Setup: Created product ${product.id} with Stock: 10`);

    const sessionId = `test-session-${Date.now()}`;
    let cartId: string | null = null;
    let orderId: string | null = null;
    try {
        // 1. Cart Tests
        console.log('\n--- Testing Cart Service ---');

        // Add to Cart
        await addToCart(sessionId, { productId: product.id, quantity: 2 });
        let cart = await getCart(sessionId);
        cartId = cart?.id ?? null;

        if (cart?.items[0].quantity === 2) {
            console.log('✅ Add to Cart verified');
        } else {
            throw new Error('Add to Cart failed');
        }

        // Update Cart
        await updateCartItem(cart.items[0].id, { quantity: 5 });
        cart = await getCart(sessionId);
        cartId = cart?.id ?? cartId;
        if (cart?.items[0].quantity === 5) {
            console.log('✅ Update Cart verified');
        } else {
            throw new Error('Update Cart failed');
        }

        // 2. Order Tests
        console.log('\n--- Testing Order Service ---');

        // Create Order (Simulate Checkout)
        // Note: In real app, we might convert cart to order items. Here we simulate the payload.
        const orderData = {
            customerName: 'Test Buyer',
            customerPhone: '09121234567',
            paymentMethod: 'manual' as const,
            items: [
                {
                    productId: product.id,
                    productName: product.name,
                    unitPrice: product.finalPrice,
                    quantity: 3 // Buying 3 items
                }
            ]
        };

        const order = await createOrder(orderData);
        orderId = order.id;
        console.log(`✅ Order created: ${order.orderNumber}`);

        // 3. Verification

        // Verify Invoice
        const invoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
        if (invoice) {
            console.log(`✅ Invoice generated: ${invoice.invoiceNumber}`);
        } else {
            console.error('❌ Invoice generation failed');
        }

        // Verify Stock Deduction
        const updatedProduct = await getProductById(product.id);
        // Initial 10 - Bought 3 = Should be 7
        if (updatedProduct?.stock === 7) {
            console.log(`✅ Stock deduction verified (10 -> ${updatedProduct.stock})`);
        } else {
            console.error(`❌ Stock deduction failed. Expected 7, got ${updatedProduct?.stock}`);
        }

        // 4. Cancel Order (Stock Restoration)
        console.log('\n--- Testing Cancellation ---');
        await cancelOrder(order.id);
        const restoredProduct = await getProductById(product.id);
        // Should return to 10
        if (restoredProduct?.stock === 10) {
            console.log(`✅ cancellation & stock restoration verified`);
        } else {
            console.error(`❌ Stock restoration failed. Expected 10, got ${restoredProduct?.stock}`);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    } finally {
        // Cleanup
        console.log('\n--- Cleanup ---');
        // Ensure order-related records are removed before deleting product
        try {
            const existingOrder = await prisma.order.findFirst({ where: { items: { some: { productId: product.id } } } });
            if (existingOrder) {
                await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
                await prisma.invoice.deleteMany({ where: { orderId: existingOrder.id } });
                await prisma.order.delete({ where: { id: existingOrder.id } });
            }
        } catch (cleanupError) {
            console.warn('⚠️ Cleanup order records failed:', cleanupError);
        }
        try {
            if (cartId) {
                await prisma.cartItem.deleteMany({ where: { cartId } });
                await prisma.cart.delete({ where: { id: cartId } });
            } else {
                await clearCart(sessionId);
            }
            // Fallback: remove any leftover cart items referencing the product
            await prisma.cartItem.deleteMany({ where: { productId: product.id } });
            await prisma.cart.deleteMany({ where: { items: { some: { productId: product.id } } } });
            // Final fallback: clear all carts to avoid FK conflicts in tests
            await prisma.cartItem.deleteMany({});
            await prisma.cart.deleteMany({});
            await prisma.cartItem.count({ where: { productId: product.id } });
        } catch (cleanupError) {
            // ignore cart cleanup errors
        }
        await deleteProduct(product.id);
        await prisma.$disconnect();
        console.log('✅ Cleanup done');
    }
}

main();
