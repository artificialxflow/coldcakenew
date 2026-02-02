import { Customer, Product, BusinessSettings } from '@/types';

export interface MessageData {
  customerName: string;
  productName: string;
  productColor?: string;
  originalPrice: number;
  discountedPrice: number;
  finalPrice: number;
  discountPercent: number;
  discountValidUntil: string;
  finalPriceValidUntil: string;
}

export function generatePersonalizedMessage(
  customer: Customer,
  product: Product,
  settings: BusinessSettings
): string {
  // Determine greeting based on name
  const isMale = customer.firstName && /^(علی|حسن|حسین|محمد|رضا|امیر|مهدی|سعید|داریوش|کامران)/.test(customer.firstName);
  const customerName = `${customer.firstName} ${customer.lastName}`;
  const greeting = isMale 
    ? `سلام آقای ${customer.firstName}`
    : customer.firstName 
    ? `سلام خانم ${customer.firstName}`
    : `سلام ${customerName}`;
  
  const discountPercent = settings.discountPercent || 10;
  const discountHours = settings.discountDurationHours || 48;
  
  // Use finalPrice as original price, or originalPrice if available
  const originalPrice = product.originalPrice || product.finalPrice || 0;
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  const finalPrice = originalPrice; // قیمت واقعی بدون تخفیف
  
  const now = new Date();
  const discountValidUntil = new Date(now.getTime() + discountHours * 60 * 60 * 1000);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Format dates in Persian
  const discountDateStr = discountValidUntil.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const monthEndStr = monthEnd.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Build product description
  let productDescription = product.name;
  if (product.category) {
    if (product.category === 'سیسمونی') {
      // برای سیسمونی، استفاده از "سرویس سیسمونی"
      productDescription = `سرویس ${product.category}${product.color ? ` رنگ ${product.color}` : ''}`;
    } else {
      // برای سایر دسته‌ها، استفاده از نام دسته
      productDescription = `${product.name}${product.color ? ` (رنگ: ${product.color})` : ''}`;
    }
  } else if (product.color) {
    productDescription = `${product.name} (رنگ: ${product.color})`;
  }
  
  // Build message according to exact format specified
  let message = `${greeting}، وقت تون بخیر!\n\n`;
  message += `محصول جدید ${productDescription} موجود شده با قیمت عالی${product.color ? ' و رنگ‌بندی زیبا' : ''}.\n\n`;
  message += `💰 قیمت فعلی محصول تا ${discountHours} ساعت آینده (${originalPrice.toLocaleString('fa-IR')} تومان با ${discountPercent}% تخفیف): ${discountedPrice.toLocaleString('fa-IR')} تومان\n\n`;
  message += `💰 قیمت واقعی محصول تا پایان ماه ${monthEndStr} (${originalPrice.toLocaleString('fa-IR')} تومان بدون تخفیف): ${finalPrice.toLocaleString('fa-IR')} تومان\n\n`;
  
  // Contact information
  if (settings.contactPhone) {
    message += `📞 شماره تماس: ${settings.contactPhone}\n`;
  }
  if (settings.telegramChannel) {
    message += `📱 کانال تلگرام: ${settings.telegramChannel}\n`;
  }
  if (settings.rubikaChannel) {
    message += `📱 روبیکا: ${settings.rubikaChannel}\n`;
  }
  if (settings.whatsappNumber) {
    message += `💬 واتساپ: ${settings.whatsappNumber}\n`;
  }
  if (settings.instagramPage) {
    message += `📸 اینستاگرام: ${settings.instagramPage}\n`;
  }
  
  if (settings.address) {
    message += `📍 آدرس: ${settings.address}\n`;
  }
  
  return message;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export function calculateDiscount(originalPrice: number, discountPercent: number): number {
  return originalPrice * (discountPercent / 100);
}

export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  return originalPrice - calculateDiscount(originalPrice, discountPercent);
}
