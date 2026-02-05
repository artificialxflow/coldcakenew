import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  MapPinIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji?: string;
  permission?: string;
}

export const allNavigation: NavItem[] = [
  { name: 'داشبورد', href: '/admin/dashboard', icon: HomeIcon, emoji: '📊', permission: 'reports.read' },
  { name: 'ارتباط با مشتری', href: '/admin/messages', icon: ChatBubbleLeftRightIcon, emoji: '💬', permission: 'reports.read' },
  { name: 'مدیریت محصولات', href: '/admin/products', icon: CubeIcon, emoji: '📦', permission: 'products.read' },
  { name: 'مدیریت قیمت', href: '/admin/gold-price', icon: ChartBarIcon, emoji: '💰', permission: 'settings.read' },
  { name: 'گزارش‌های مالی', href: '/admin/reports', icon: DocumentTextIcon, emoji: '📊', permission: 'reports.read' },
  { name: 'سفارشات', href: '/admin/orders', icon: ShoppingCartIcon, emoji: '🛒', permission: 'orders.read' },
  { name: 'فاکتورها', href: '/admin/invoices', icon: DocumentTextIcon, emoji: '🧾', permission: 'invoices.read' },
  { name: 'تحلیل و پیش‌بینی', href: '/admin/analytics', icon: ChartBarIcon, emoji: '🔮', permission: 'reports.read' },
  { name: 'بازاریابی محتوا', href: '/admin/content', icon: DocumentTextIcon, emoji: '📝', permission: 'settings.read' },
  { name: 'اسکریپ گوگل مپ', href: '/admin/maps-scraper', icon: MapPinIcon, emoji: '🗺️', permission: 'settings.read' },
  { name: 'اتوماسیون', href: '/admin/workflows', icon: ArrowsRightLeftIcon, emoji: '⚙️', permission: 'settings.read' },
  { name: 'بلاگ', href: '/admin/blog-admin', icon: BookOpenIcon, emoji: '📝', permission: 'settings.read' },
  { name: 'مدیریت کاربران', href: '/admin/users', icon: UserGroupIcon, emoji: '👥', permission: 'users.read' },
  { name: 'تنظیمات', href: '/admin/settings', icon: Cog6ToothIcon, emoji: '⚙️', permission: 'settings.read' },
];
