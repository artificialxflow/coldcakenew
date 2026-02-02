'use client';

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'کیک سرد' }: HeaderProps) {
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
    </header>
  );
}
