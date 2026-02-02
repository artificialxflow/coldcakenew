'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}

const navigation: NavItem[] = [
  { name: 'داشبورد', href: '/dashboard', icon: HomeIcon, emoji: '📊' },
  { name: 'مشتری', href: '/messages', icon: ChatBubbleLeftRightIcon, emoji: '💬' },
  { name: 'قیمت', href: '/gold-price', icon: ChartBarIcon, emoji: '💰' },
  { name: 'گزارش', href: '/reports', icon: DocumentTextIcon, emoji: '📊' },
  { name: 'تحلیل', href: '/analytics', icon: ChartBarIcon, emoji: '🔮' },
  { name: 'گوگل‌مپ', href: '/maps-scraper', icon: MapPinIcon, emoji: '🗺️' },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors duration-200
                ${isActive
                  ? 'text-yellow-600 bg-yellow-50'
                  : 'text-gray-600 hover:text-yellow-600'
                }
              `}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'text-yellow-600' : ''}`} />
              <span className="text-xs mt-1">{item.emoji}</span>
              <span className="text-xs mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
