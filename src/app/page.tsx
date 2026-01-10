'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchDashboardStats, fetchChartData, fetchProducts } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats, ChartData, Product } from '@/types';



// Professional stats card component
const ProfessionalStatsCard = ({ 
  title, 
  value, 
  subtitle, 
  trend,
  icon: Icon,
  color = 'blue',
  isRealtime = true 
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  trend?: { value: number; isPositive: boolean };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
  isRealtime?: boolean;
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
    red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  };

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].light}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].text}`} />
        </div>
        {isRealtime && (
          <div className="flex items-center px-2.5 py-1 bg-green-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="text-2xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
          {value}
        </p>
        
        <div className="flex items-center justify-between mt-3">
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center text-xs font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg 
                className={`w-4 h-4 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons for stats cards
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CurrencyDollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading dashboard data...');
        
        const [dashboardStats, products] = await Promise.all([
          fetchDashboardStats(),
          fetchProducts()
        ]);
        
        console.log('Dashboard stats received:', dashboardStats);
        
        const lowStock = products.filter((p: Product) => {
          const stock = p.stock || 0;
          const minStock = p.min_stock || 5;
          return stock <= minStock;
        });

        const safeStats = {
          totalProducts: dashboardStats?.totalProducts || 0,
          lowStockProducts: dashboardStats?.lowStockProducts || 0,
          todaySales: dashboardStats?.todaySales || 0,
          todayTransactionCount: dashboardStats?.todayTransactionCount || 0,
          totalSales: dashboardStats?.totalSales || 0,
          totalPurchases: dashboardStats?.totalPurchases || 0,
          profit: dashboardStats?.profit || 0,
          recentTransactions: dashboardStats?.recentTransactions || [],
          topProducts: dashboardStats?.topProducts || []
        };

        setStats(safeStats);
        setLowStockProducts(lowStock);
        setLastUpdated(new Date());
        console.log('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setStats({
          totalProducts: 0,
          lowStockProducts: 0,
          todaySales: 0,
          todayTransactionCount: 0,
          totalSales: 0,
          totalPurchases: 0,
          profit: 0,
          recentTransactions: [],
          topProducts: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Professional Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="mb-2 sm:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-slate-900 max-w-2xl">
            Monitor performa bisnis Anda secara real-time.
          </p>
        </div>
        <div className="flex flex-col sm:items-end space-y-2">
          <div className="flex items-center space-x-3">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-blue-600 border-t-transparent"></div>
            )}
            <div className="px-2.5 md:px-3 py-1 md:py-1.5 bg-slate-100 rounded-full">
              <span className="text-xs md:text-sm font-medium text-slate-700">
                {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>
          <div className="flex items-center text-xs md:text-sm text-slate-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Auto-refresh setiap 15 detik
          </div>
        </div>
      </div>

      {/* Professional Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <ProfessionalStatsCard
          title="Total Penjualan"
          value={formatCurrency(stats?.totalSales || 0, true)}
          subtitle="Semua waktu"
          icon={CurrencyDollarIcon}
          color="blue"
        />
        <ProfessionalStatsCard
          title="Keuntungan Bersih"
          value={formatCurrency(stats?.profit || 0, true)}
          subtitle={`${stats?.todayTransactionCount || 0} transaksi`}
          icon={TrendingUpIcon}
          color={(stats?.profit || 0) >= 0 ? 'green' : 'red'}
        />
        <ProfessionalStatsCard
          title="Penjualan Hari Ini"
          value={formatCurrency(stats?.todaySales || 0, true)}
          subtitle={`${stats?.todayTransactionCount || 0} transaksi`}
          icon={ShoppingBagIcon}
          color="purple"
        />
        <ProfessionalStatsCard
          title="Stok Menipis"
          value={(stats?.lowStockProducts || 0).toString()}
          subtitle="Item perlu restock"
          icon={ExclamationTriangleIcon}
          color="orange"
        />
      </div>

      {/* Low Stock Alert - Full Width */}
      <div className="bg-white rounded-2xl p-6 card-shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Peringatan Stok</h3>
            <p className="text-sm text-slate-600 mt-1">Item yang perlu direstock</p>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-orange-100 rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs font-semibold text-orange-700">Alert</span>
          </div>
        </div>
        
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-700 font-medium">Stok Aman</p>
            <p className="text-sm text-slate-500 mt-1">Semua produk memiliki stok yang mencukupi</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {lowStockProducts.slice(0, 6).map((product: Product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{product.name}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium text-orange-600">{product.stock || 0}</span> / {product.min_stock || 5} minimum
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <span className="px-3 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                    Restock
                  </span>
                </div>
              </div>
            ))}
            {lowStockProducts.length > 6 && (
              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  +{lowStockProducts.length - 6} produk lainnya perlu restock
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Professional Quick Actions */}
      <div className="bg-white rounded-2xl p-8 card-shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Aksi Cepat</h3>
          <p className="text-slate-600">Akses fitur utama dengan sekali klik</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/transactions"
            className="group p-6 border-2 border-dashed border-blue-200 rounded-2xl text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-blue-700 font-semibold mb-1">Transaksi Baru</div>
            <div className="text-sm text-blue-600">Input penjualan produk</div>
          </Link>
          
          <Link
            href="/inventory"
            className="group p-6 border-2 border-dashed border-purple-200 rounded-2xl text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-purple-700 font-semibold mb-1">Kelola Stok</div>
            <div className="text-sm text-purple-600">Tambah & update inventory</div>
          </Link>
          
          <Link
            href="/reports"
            className="group p-6 border-2 border-dashed border-green-200 rounded-2xl text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-green-700 font-semibold mb-1">Lihat Laporan</div>
            <div className="text-sm text-green-600">Analisis & insights</div>
          </Link>
        </div>
      </div>
    </div>
  );
}