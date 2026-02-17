// Types for Cold Cake Business Management System

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  favoriteProducts?: string[];
  preferences?: {
    productType?: string[];
    colors?: string[];
    quality?: string;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  lastSuggestedProduct?: string;
  lastPurchaseDate?: string;
  totalPurchases?: number;
  purchaseHistory?: Purchase[];
  visitHistory?: Visit[];
  socialInteractions?: SocialInteraction[];
  manualDebtBalance?: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  color?: string;
  originalPrice: number;
  discountedPrice?: number;
  finalPrice: number;
  category?: string;
  categoryId?: string;
  stock?: number;
  priceHistory?: PriceChange[];
  description?: string;
  images?: string[];
  slug?: string;
  priceType?: 'fixed' | 'call_for_price' | 'negotiable';
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PriceChange {
  date: string;
  price: number;
  reason: 'gold_price_increase' | 'manual' | 'discount';
}

export interface Message {
  id: string;
  customerId: string;
  customerName: string;
  content: string;
  platform: 'telegram' | 'whatsapp' | 'rubika' | 'instagram';
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  productId?: string;
  templateId?: string;
  isAutomated?: boolean;
  automationRunId?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  createdAt: string;
}

export interface GoldPrice {
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  yearlyHighest: number;
  yearlyHighestDate: string;
  history?: GoldPriceHistory[];
}

export interface GoldPriceHistory {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName?: string;
  amount: number;
  date: string;
  products: Product[];
  month: number;
  year: number;
  items?: SaleItem[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Purchase {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  amount: number;
  date: string;
  quantity: number;
}

export interface ProductPurchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  purchaseDate: string;
  supplier?: string;
}

export interface Report {
  monthlySales: number;
  highestGoldPrice: number;
  messagesSentToday: number;
  workingCapital: number;
  bestSellingMonth?: {
    month: number;
    year: number;
    sales: number;
  };
  totalInventory?: number;
  totalDebts?: number;
}

export interface Debt {
  id: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  checkNumber?: string;
  daysUntilDue?: number;
  bank?: string;
  receiveDate?: string;
  paidDate?: string;
  type?: 'received' | 'paid';
  description?: string;
  accountNumber?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  rowNumber?: number;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountType: 'current' | 'savings' | 'other';
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  rowNumber: number;
  date: string;
  accountId: string;
  accountNumber: string;
  type: 'received' | 'paid';
  checkNumber?: string;
  paidCheckNumber?: string;
  description?: string;
  debit?: number;
  credit?: number;
  balance: number;
  manualRemaining?: number;
  customerId?: string;
  customerName?: string;
  bank?: string;
  dueDate?: string;
  status?: 'pending' | 'paid';
}

export interface Content {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  file?: File;
  originalCaption?: string;
  aiEnhancedCaption?: string;
  publishedAt?: string;
  platforms?: ('telegram' | 'whatsapp' | 'rubika' | 'instagram' | 'youtube' | 'aparat')[];
  status?: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
}

export interface Inventory {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface Visit {
  id: string;
  customerId: string;
  source: 'website' | 'instagram' | 'telegram' | 'whatsapp' | 'other';
  url?: string;
  timestamp: string;
  duration?: number;
}

export interface SocialInteraction {
  id: string;
  customerId: string;
  platform: 'instagram' | 'telegram' | 'whatsapp';
  type: 'like' | 'comment' | 'share' | 'view';
  contentId?: string;
  timestamp: string;
}

export interface CustomerInterest {
  customerId: string;
  productTypes: { type: string; score: number }[];
  colors: { color: string; score: number }[];
  quality: { level: string; score: number }[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

export interface SeasonalPrediction {
  id: string;
  productId: string;
  productName: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  predictedSales: number;
  recommendationDate: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  confidence?: number;
}

export interface BusinessSettings {
  businessName?: string;
  contactPhone: string;
  telegramChannel: string;
  rubikaChannel: string;
  whatsappNumber: string;
  instagramPage: string;
  address?: string;
  goldPriceIncreasePercent?: number;
  discountPercent?: number;
  discountDurationHours?: number;
  pricingVariable?: 'gold' | 'usd' | 'eur' | 'custom';
  priceIncreasePercent?: number;
  autoPriceUpdateEnabled?: boolean;
  autoPriceUpdateTime?: string;
  automatedMessaging?: AutomatedMessagingSettings;
}

export interface AutomatedMessagingSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  sendTime: string;
  daysOfWeek?: number[];
  platforms: Message['platform'][];
  customerFilters: {
    lastPurchaseDays?: number;
    hasFavorites?: boolean;
    excludeRecentCustomers?: boolean;
    minDaysSinceLastMessage?: number;
  };
}

export interface PriceUpdateLog {
  id: string;
  date: string;
  variable: 'gold' | 'usd' | 'eur' | 'custom';
  previousPrice: number;
  newPrice: number;
  productsAffected: number;
  totalPriceIncrease: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  productUpdates?: ProductPriceUpdate[];
}

export interface ProductPriceUpdate {
  productId: string;
  productName: string;
  previousPrice: number;
  newPrice: number;
  priceIncrease: number;
  priceIncreasePercent: number;
}

export interface AutomatedMessageRun {
  id: string;
  scheduledAt: string;
  executedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  frequency: 'daily' | 'weekly' | 'monthly';
  totalCustomers: number;
  sentMessages: number;
  failedMessages: number;
  successRate: number;
  messages: string[];
  error?: string;
}

export interface MapsScrapeTarget {
  id: string;
  keyword: string;
  city: string;
  radius?: number;
  radiusType?: 'km' | 'city';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  totalFound?: number;
}

export interface ScrapedBusiness {
  id: string;
  scrapeTargetId: string;
  name: string;
  phone?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  scrapedAt: string;
  status: 'new' | 'contacted' | 'converted' | 'ignored';
  notes?: string;
}

export interface MapsScrapeRun {
  id: string;
  targetId: string;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalFound: number;
  businessesScraped: string[];
  error?: string;
  progress?: number;
}

// ==================== E-commerce Types ====================

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'online' | 'phone' | 'manual' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  notes?: string;
  items: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'online' | 'phone' | 'manual' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  gateway?: 'zarinpal' | 'idpay' | 'pep';
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  sessionId: string;
  customerId?: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  category?: string;
  tags?: string[];
  author?: string;
  published: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  customerId: string;
  title?: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
