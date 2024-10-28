// components/ClientLayout.tsx
"use client";

import { usePathname } from 'next/navigation';
import MainLayout from '@/components/mainlayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const excludeLayout = ['/login', '/signup']; // 不使用 MainLayout 的路徑

  return excludeLayout.includes(pathname) ? children : <MainLayout>{children}</MainLayout>;
}
