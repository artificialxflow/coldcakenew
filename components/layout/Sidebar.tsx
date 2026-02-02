'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  MapPinIcon,
  CubeIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji?: string;
  permission?: string;
}

const allNavigation: NavItem[] = [
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

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [permissionKeys, setPermissionKeys] = useState<string[] | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : { user: null })
      .then((data) => {
        if (data?.user?.permissionKeys) {
          setPermissionKeys(Array.isArray(data.user.permissionKeys) ? data.user.permissionKeys : []);
        } else {
          setPermissionKeys([]);
        }
      })
      .catch(() => setPermissionKeys([]));
  }, []);

  const navigation = permissionKeys === null
    ? allNavigation
    : permissionKeys.includes('*')
      ? allNavigation
      : allNavigation.filter((item) => !item.permission || permissionKeys.includes(item.permission));

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="no-print lg:hidden fixed top-4 right-4 z-50 p-2 bg-yellow-600 text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-40
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-yellow-600">🧠 کیک سرد</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Collapse sidebar"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center space-x-3 space-x-reverse p-3 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-yellow-100 text-yellow-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="flex items-center gap-2">
                      {item.emoji && <span>{item.emoji}</span>}
                      <span>{item.name}</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                کیک سرد | coldcake.ir
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
