'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main content area */}
      <div className="lg:mr-64 transition-all duration-300">
        <Header title={title} />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
