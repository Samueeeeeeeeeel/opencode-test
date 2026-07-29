'use client';

import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header />
      <main className="flex-1 p-3 pb-24 lg:pb-6">{children}</main>
      <MobileNav />
    </div>
  );
}
