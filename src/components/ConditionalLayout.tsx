'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-32 right-20 w-40 h-40 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 left-32 w-36 h-36 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
      <Sidebar />
      <main className="flex-1 overflow-auto lg:ml-0 relative z-10">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}