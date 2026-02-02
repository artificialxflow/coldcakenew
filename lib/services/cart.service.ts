import { prisma } from '../db/prisma';

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

/**
 * Get or create cart by session ID
 */
export async function getOrCreateCart(sessionId: string, customerId?: string) {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        sessionId,
        customerId: customerId || undefined,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } else if (customerId && !cart.customerId) {
    // Update cart with customer ID if user logged in
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return cart;
}

/**
 * Add item to cart
 */
export async function addToCart(sessionId: string, data: AddToCartData, customerId?: string) {
  const cart = await getOrCreateCart(sessionId, customerId);

  // Check if product exists and is available
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock !== undefined && product.stock < data.quantity) {
    throw new Error('Insufficient stock');
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: data.productId,
    },
  });

  if (existingItem) {
    // Update quantity
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + data.quantity,
      },
      include: {
        product: true,
      },
    });
  }

  // Create new cart item
  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: data.productId,
      quantity: data.quantity,
    },
    include: {
      product: true,
    },
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(cartItemId: string, data: UpdateCartItemData) {
  if (data.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  // Check stock availability
  if (cartItem.product.stock !== undefined && cartItem.product.stock < data.quantity) {
    throw new Error('Insufficient stock');
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity: data.quantity,
    },
    include: {
      product: true,
    },
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string) {
  return prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

/**
 * Get cart by session ID
 */
export async function getCart(sessionId: string) {
  return prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

/**
 * Clear cart
 */
export async function clearCart(sessionId: string) {
  const cart = await prisma.cart.findUnique({
    where: { sessionId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return cart;
}

/**
 * Calculate cart total
 */
export function calculateCartTotal(cart: {
  items: Array<{
    quantity: number;
    product: {
      finalPrice: number;
      priceType?: string;
    };
  }>;
}): number {
  return cart.items.reduce((total, item) => {
    if (item.product.priceType === 'call_for_price') {
      return total; // Skip call for price items in total
    }
    return total + item.product.finalPrice * item.quantity;
  }, 0);
}
