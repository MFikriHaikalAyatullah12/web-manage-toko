'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

// Simple SVG icons
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
  </svg>
);

const CubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const Bars3Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transaksi Penjualan', href: '/transactions', icon: ShoppingCartIcon },
  { name: 'Manajemen Stok', href: '/inventory', icon: CubeIcon },
  { name: 'Laporan', href: '/reports', icon: DocumentTextIcon },
  { name: 'Analisis', href: '/analytics', icon: ChartBarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { logout } = useAuth();

  const handleResetData = async () => {
    try {
      const response = await fetch('/api/reset-data', { method: 'POST' });
      if (response.ok) {
        alert('Semua data berhasil dihapus!');
        window.location.reload();
      } else {
        alert('Gagal menghapus data!');
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Gagal menghapus data!');
    }
    setShowResetConfirm(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-md shadow-lg"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-amber-200 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center space-x-2">
              <ShoppingCartIcon className="h-6 w-6" />
              <h1 className="text-lg font-bold">Manage Toko</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-amber-100 text-amber-800 border-r-4 border-amber-600'
                      : 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                    }
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-amber-600' : 'text-amber-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="px-4 py-4 space-y-2 border-t border-amber-100">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="mr-3 h-5 w-5" />
              Reset Data
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-colors"
            >
              <LogoutIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-amber-100">
            <p className="text-xs text-amber-600 text-center">
              © 2025 Manage Toko
            </p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-amber-200 shadow-2xl">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              Konfirmasi Reset Data
            </h3>
            <p className="text-amber-700 mb-6 text-sm">
              Apakah Anda yakin ingin menghapus semua data transaksi dan pembelian? 
              Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleResetData}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-amber-100 text-amber-700 py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}