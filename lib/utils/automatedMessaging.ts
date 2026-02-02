import { Customer, Product, AutomatedMessagingSettings, Message } from '@/types';
import { generatePersonalizedMessage } from './messageGenerator';
import { BusinessSettings } from '@/types';
import { getBestSellingProducts } from '@/lib/services/sale.service';

/**
 * انتخاب مشتریان مناسب برای ارسال خودکار پیام
 */
export function selectCustomersForAutomatedMessaging(
  customers: Customer[],
  settings: AutomatedMessagingSettings,
  messages: Message[]
): Customer[] {
  let selected = [...customers];

  // فیلتر بر اساس آخرین خرید
  if (settings.customerFilters.lastPurchaseDays) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - settings.customerFilters.lastPurchaseDays);
    
    selected = selected.filter((customer) => {
      if (!customer.lastPurchaseDate) return false;
      return new Date(customer.lastPurchaseDate) >= daysAgo;
    });
  }

  // فیلتر بر اساس محصولات مورد علاقه
  if (settings.customerFilters.hasFavorites) {
    selected = selected.filter((customer) => 
      customer.favoriteProducts && customer.favoriteProducts.length > 0
    );
  }

  // جلوگیری از ارسال مکرر (حداقل فاصله بین پیام‌ها)
  if (settings.customerFilters.minDaysSinceLastMessage) {
    const minDays = settings.customerFilters.minDaysSinceLastMessage;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - minDays);

    selected = selected.filter((customer) => {
      // پیدا کردن آخرین پیام برای این مشتری
      const customerMessages = messages
        .filter((m) => m.customerId === customer.id)
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      if (customerMessages.length === 0) return true; // اگر پیامی نداشته، انتخاب شود

      const lastMessage = customerMessages[0];
      return new Date(lastMessage.sentAt) < minDate;
    });
  }

  return selected;
}

/**
 * تولید پیام خودکار برای یک مشتری
 */
export async function generateAutomatedMessage(
  customer: Customer,
  products: Product[],
  settings: BusinessSettings,
  userId: string,
  bestSellingProducts?: Product[] // پرفروش‌ترین محصولات (اختیاری)
): Promise<{ message: string; product: Product | null }> {
  // پیدا کردن محصول مناسب
  let selectedProduct: Product | null = null;

  // اولویت 1: محصولات مورد علاقه مشتری (اگر خرید قبلی داشته)
  if (customer.favoriteProducts && customer.favoriteProducts.length > 0) {
    selectedProduct = products.find((p) => 
      customer.favoriteProducts?.includes(p.id)
    ) || null;
  }

  // اولویت 2: محصولات بر اساس علاقه‌مندی‌های مشتری (از خریدهای قبلی)
  if (!selectedProduct && customer.preferences?.productType) {
    const preferredTypes = customer.preferences.productType;
    selectedProduct = products.find((p) => 
      preferredTypes.includes(p.category || '')
    ) || null;
  }

  // اولویت 3: پرفروش‌ترین محصولات (برای مشتریان جدید یا بدون خرید قبلی)
  if (!selectedProduct) {
    // اگر bestSellingProducts ارائه نشده، از sale service بگیر
    if (!bestSellingProducts || bestSellingProducts.length === 0) {
      try {
        bestSellingProducts = await getBestSellingProducts(userId, 5);
      } catch (error) {
        console.error('Error fetching best selling products:', error);
      }
    }

    if (bestSellingProducts && bestSellingProducts.length > 0) {
      // انتخاب اولین پرفروش‌ترین محصول که در لیست products موجود است
      selectedProduct = products.find((p) => 
        bestSellingProducts!.some((bp) => bp.id === p.id)
      ) || bestSellingProducts[0];
    } else if (products.length > 0) {
      // Fallback: اولین محصول موجود
      selectedProduct = products[0];
    }
  }

  if (!selectedProduct || !settings) {
    return { message: '', product: null };
  }

  const message = generatePersonalizedMessage(customer, selectedProduct, settings);
  return { message, product: selectedProduct };
}

/**
 * بررسی اینکه آیا زمان ارسال خودکار رسیده است یا نه
 */
export function shouldRunAutomatedMessaging(
  settings: AutomatedMessagingSettings,
  lastRun?: string
): boolean {
  if (!settings.enabled) return false;

  const now = new Date();
  const sendTime = settings.sendTime.split(':');
  const sendHour = parseInt(sendTime[0]);
  const sendMinute = parseInt(sendTime[1]);

  // بررسی فرکانس
  switch (settings.frequency) {
    case 'daily':
      // هر روز در ساعت مشخص
      if (now.getHours() === sendHour && now.getMinutes() === sendMinute) {
        if (!lastRun) return true;
        const lastRunDate = new Date(lastRun);
        return lastRunDate.toDateString() !== now.toDateString();
      }
      break;

    case 'weekly':
      // در روزهای مشخص هفته
      if (settings.daysOfWeek && settings.daysOfWeek.includes(now.getDay())) {
        if (now.getHours() === sendHour && now.getMinutes() === sendMinute) {
          if (!lastRun) return true;
          const lastRunDate = new Date(lastRun);
          // بررسی که حداقل یک هفته گذشته باشد
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastRunDate < weekAgo;
        }
      }
      break;

    case 'monthly':
      // اول هر ماه
      if (now.getDate() === 1 && now.getHours() === sendHour && now.getMinutes() === sendMinute) {
        if (!lastRun) return true;
        const lastRunDate = new Date(lastRun);
        return lastRunDate.getMonth() !== now.getMonth() || 
               lastRunDate.getFullYear() !== now.getFullYear();
      }
      break;
  }

  return false;
}

/**
 * شبیه‌سازی ارسال پیام (در واقعیت باید API call باشد)
 */
export async function simulateSendMessage(
  message: string,
  platform: Message['platform'],
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  // شبیه‌سازی تاخیر شبکه
  await new Promise((resolve) => setTimeout(resolve, 500));

  // شبیه‌سازی موفقیت/خطا (90% موفقیت)
  const success = Math.random() > 0.1;

  if (success) {
    return { success: true };
  } else {
    return { 
      success: false, 
      error: `خطا در ارسال به ${platform}` 
    };
  }
}
