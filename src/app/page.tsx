'use client';

import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchChartData, fetchProducts } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats, ChartData, Product } from '@/types';

// Simple chart component
const SimpleChart = ({ data }: { data: ChartData[] }) => {
  const safeData = Array.isArray(data) ? data : [];
  
  if (safeData.length === 0) {
    return (
      <div className="h-64 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Penjualan 7 Hari Terakhir</h3>
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">Tidak ada data penjualan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow border border-amber-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-amber-800 flex-1 min-w-0">Penjualan 7 Hari Terakhir</h3>
        <div className="flex items-center text-xs text-green-600 ml-2 flex-shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
          Real-time
        </div>
      </div>
      <div className="flex items-end space-x-2 h-40">
        {safeData.map((item, index) => {
          const maxSales = Math.max(...safeData.map(d => d.sales || 0).filter(s => s > 0), 1);
          const itemSales = item.sales || 0;
          const height = maxSales > 0 && itemSales > 0 ? (itemSales / maxSales) * 100 : 0;
          const safeHeight = Math.max(0, Math.min(100, height));
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-amber-800 mb-1">
                {formatCurrency(itemSales)}
              </div>
              <div 
                className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t transition-all duration-300"
                style={{ height: `${safeHeight}%`, minHeight: '4px' }}
              />
              <div className="text-xs text-amber-700 mt-1">
                {item.day || item.date || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  color = 'amber',
  isRealtime = true 
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  color?: 'amber' | 'green' | 'red' | 'orange';
  isRealtime?: boolean;
}) => {
  const colorClasses = {
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-amber-200 relative min-h-[120px]">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${colorClasses[color]} bg-opacity-10 flex-shrink-0`}>
              <div className={`w-4 h-4 ${colorClasses[color]} rounded`}></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-amber-800">{title}</p>
            </div>
          </div>
          {isRealtime && (
            <div className="flex items-center text-xs text-green-600 flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              Live
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-2xl font-bold text-amber-900 whitespace-nowrap overflow-visible">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-amber-700 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading dashboard data...');
        
        const [dashboardStats, salesData, products] = await Promise.all([
          fetchDashboardStats(),
          fetchChartData(),
          fetchProducts()
        ]);
        
        console.log('Dashboard stats received:', dashboardStats);
        console.log('Total sales value:', dashboardStats?.totalSales);
        console.log('Today sales value:', dashboardStats?.todaySales);
        console.log('Profit value:', dashboardStats?.profit);
        
        const lowStock = products.filter((p: Product) => {
          const stock = p.stock || 0;
          const minStock = p.min_stock || 5;
          return stock <= minStock;
        });

        // Pastikan data stats ada sebelum set
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
        setChartData(salesData);
        setLowStockProducts(lowStock);
        setLastUpdated(new Date());
        console.log('Dashboard data loaded successfully with safe stats:', safeStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set fallback empty stats to prevent showing loading forever
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
    
    // Load data immediately
    loadData();
    
    // Set up auto-refresh every 15 seconds for realtime dashboard
    const interval = setInterval(loadData, 15000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Dashboard</h1>
          <p className="text-amber-700">Selamat datang di sistem manajemen toko Anda</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
            )}
            <span className="text-sm text-amber-700">
              Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          </div>
          <div className="text-xs text-amber-600 mt-1">
            🔄 Auto-refresh setiap 15 detik
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Penjualan"
          value={formatCurrency(stats?.totalSales || 0)}
          subtitle="Semua waktu"
          color="amber"
        />
        <StatsCard
          title="Keuntungan Bersih"
          value={formatCurrency(stats?.profit || 0)}
          subtitle={`${stats?.todayTransactionCount || 0} transaksi`}
          color={(stats?.profit || 0) >= 0 ? 'green' : 'red'}
        />
        <StatsCard
          title="Penjualan Hari Ini"
          value={formatCurrency(stats?.todaySales || 0)}
          subtitle={`${stats?.todayTransactionCount || 0} transaksi`}
          color="green"
        />
        <StatsCard
          title="Stok Menipis"
          value={(stats?.lowStockProducts || 0).toString()}
          subtitle="Item perlu restock"
          color="orange"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <SimpleChart data={chartData} />

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow border border-amber-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-amber-800 flex-1 min-w-0">Peringatan Stok Rendah</h3>
            <div className="flex items-center text-xs text-orange-600 ml-2 flex-shrink-0">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-1"></div>
              Alert
            </div>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-amber-700">Semua produk stoknya mencukupi</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product: Product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-800 truncate">{product.name}</p>
                    <p className="text-sm text-amber-700">
                      Stok: {product.stock || 0} / Min: {product.min_stock || 5}
                    </p>
                  </div>
                  <span className="text-orange-600 text-sm font-medium ml-2 flex-shrink-0">
                    Perlu Restock
                  </span>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-amber-700 text-center">
                  +{lowStockProducts.length - 5} produk lainnya perlu restock
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border border-amber-200">
        <h3 className="text-lg font-semibold mb-4 text-amber-800">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/transactions"
            className="p-4 border-2 border-dashed border-amber-300 rounded-lg text-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
          >
            <div className="text-amber-600 font-medium">Transaksi Baru</div>
            <div className="text-sm text-amber-700">Input penjualan</div>
          </a>
          <a
            href="/inventory"
            className="p-4 border-2 border-dashed border-amber-300 rounded-lg text-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
          >
            <div className="text-amber-600 font-medium">Tambah Stok</div>
            <div className="text-sm text-amber-700">Input pembelian</div>
          </a>
          <a
            href="/reports"
            className="p-4 border-2 border-dashed border-amber-300 rounded-lg text-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
          >
            <div className="text-amber-600 font-medium">Lihat Laporan</div>
            <div className="text-sm text-amber-700">Analisis penjualan</div>
          </a>
        </div>
      </div>
    </div>
  );
}