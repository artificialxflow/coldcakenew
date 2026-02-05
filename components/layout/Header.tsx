'use client';

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { allNavigation } from './navigation';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'کیک سرد' }: HeaderProps) {
  const pathname = usePathname();
  const [permissionKeys, setPermissionKeys] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data?.user?.permissionKeys) {
          setPermissionKeys(Array.isArray(data.user.permissionKeys) ? data.user.permissionKeys : []);
        } else {
          setPermissionKeys([]);
        }
      })
      .catch(() => setPermissionKeys([]));
  }, []);

  const topNavHrefs = useMemo(
    () => new Set([
      '/admin/dashboard',
      '/admin/products',
      '/admin/messages',
      '/admin/settings',
      '/admin/blog-admin',
    ]),
    []
  );

  const topNavigation = useMemo(() => {
    const base = allNavigation.filter((item) => topNavHrefs.has(item.href));
    if (permissionKeys === null) return base;
    if (permissionKeys.includes('*')) return base;
    return base.filter((item) => !item.permission || permissionKeys.includes(item.permission));
  }, [permissionKeys, topNavHrefs]);

  return (
    <header className="no-print bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Title */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <button
            className="relative p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <button
            className="flex items-center space-x-2 space-x-reverse p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            aria-label="User menu"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="hidden md:block text-sm font-medium">کاربر</span>
          </button>
        </div>
      </div>
      <nav className="border-t border-gray-100">
        <div className="px-4 lg:px-6 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {topNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-yellow-100 text-yellow-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
