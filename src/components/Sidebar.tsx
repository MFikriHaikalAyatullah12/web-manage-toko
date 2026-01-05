'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

// Modern SVG icons
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

const StoreIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, color: 'blue' },
  { name: 'Transaksi Penjualan', href: '/transactions', icon: ShoppingCartIcon, color: 'green' },
  { name: 'Manajemen Stok', href: '/inventory', icon: CubeIcon, color: 'purple' },
  { name: 'Laporan', href: '/reports', icon: DocumentTextIcon, color: 'orange' },
  { name: 'Analisis', href: '/analytics', icon: ChartBarIcon, color: 'cyan' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { logout } = useAuth();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Close sidebar on left swipe
    if (isLeftSwipe && isOpen) {
      setIsOpen(false);
    }
    
    // Open sidebar on right swipe from edge
    if (isRightSwipe && !isOpen && touchStart < 50) {
      setIsOpen(true);
    }
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

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
      {/* Mobile menu button - Enhanced touch target */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 min-h-[44px] min-w-[44px] bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay with backdrop blur */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleOverlayClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      )}

      {/* Sidebar with swipe gesture support */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`
        fixed inset-y-0 left-0 z-40 w-72 shadow-2xl transform transition-transform duration-300 ease-out glass
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-slate-700/50" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg float">
                <StoreIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">Manage Toko</h1>
                <p className="text-xs text-white/80 font-medium">Sistem Manajemen</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest px-3 mb-4 flex items-center">
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent mr-2"></div>
              Menu Utama
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden
                    ${isActive
                      ? 'text-white shadow-xl scale-105'
                      : 'text-slate-300 hover:text-white hover:scale-102'
                    }
                  `}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)'
                  } : {}}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-700/50 to-slate-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  <item.icon className={`mr-4 h-5 w-5 flex-shrink-0 relative z-10 ${
                    isActive ? 'text-white drop-shadow-lg' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span className="truncate relative z-10">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto relative z-10">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="px-4 py-4 space-y-2 border-t border-slate-700/50">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest px-3 mb-3 flex items-center">
              <div className="w-8 h-0.5 bg-gradient-to-r from-red-500 to-transparent mr-2"></div>
              Tindakan
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <TrashIcon className="mr-4 h-5 w-5 flex-shrink-0 relative z-10" />
              <span className="relative z-10">Reset Data</span>
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-700/50 to-slate-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogoutIcon className="mr-4 h-5 w-5 flex-shrink-0 relative z-10" />
              <span className="relative z-10">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 bg-gradient-to-b from-transparent to-black/30">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-medium">© 2026 Manage Toko</p>
                <p className="text-xs text-slate-500">Professional Edition</p>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="status-dot status-online"></div>
                <span className="text-xs text-green-400 font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Konfirmasi Reset Data
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Apakah Anda yakin ingin menghapus semua data transaksi dan pembelian? 
                <strong className="text-red-600"> Aksi ini tidak dapat dibatalkan.</strong>
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleResetData}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Ya, Hapus Semua
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors font-medium"
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