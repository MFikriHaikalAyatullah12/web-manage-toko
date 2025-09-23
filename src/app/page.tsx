'use client';

import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchChartData, fetchProducts } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { DashboardStats, ChartData, Product } from '@/types';

// Simple chart component
const SimpleChart = ({ data }: { data: ChartData[] }) => (
  <div className="h-64 bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-gray-900">Penjualan 7 Hari Terakhir</h3>
    <div className="flex items-end space-x-2 h-40">
      {data.map((item, index) => {
        const maxSales = Math.max(...data.map(d => d.sales));
        const height = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="text-xs text-gray-900 mb-1">
              {formatCurrency(item.sales)}
            </div>
            <div 
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <div className="text-xs text-gray-900 mt-1">{item.date}</div>
          </div>
        );
      })}
    </div>
  </div>
);

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  color = 'blue' 
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  color?: 'blue' | 'green' | 'red' | 'yellow';
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-10`}>
          <div className={`w-6 h-6 ${colorClasses[color]} rounded`}></div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-900">{subtitle}</p>
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
        const [dashboardStats, salesData, products] = await Promise.all([
          fetchDashboardStats(),
          fetchChartData(),
          fetchProducts()
        ]);
        
        const lowStock = products.filter((p: Product) => p.stock <= p.minStock);

        setStats(dashboardStats);
        setChartData(salesData);
        setLowStockProducts(lowStock);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load data immediately
    loadData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-900">Memuat dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-900">Selamat datang di sistem manajemen toko Anda</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <span className="text-sm text-gray-900">
              Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          </div>
          <div className="text-xs text-gray-900 mt-1">
            Auto-refresh setiap 30 detik
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Penjualan"
          value={formatCurrency(stats.totalSales)}
          subtitle="Semua waktu"
          color="blue"
        />
        <StatsCard
          title="Keuntungan Bersih"
          value={formatCurrency(stats.totalProfit)}
          subtitle={`Growth ${stats.monthlyGrowth}%`}
          color={stats.totalProfit >= 0 ? 'green' : 'red'}
        />
        <StatsCard
          title="Penjualan Hari Ini"
          value={formatCurrency(stats.todaySales)}
          subtitle={`Profit: ${formatCurrency(stats.todayProfit)}`}
          color="green"
        />
        <StatsCard
          title="Stok Menipis"
          value={stats.lowStockItems.toString()}
          subtitle="Item perlu restock"
          color="yellow"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <SimpleChart data={chartData} />

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Peringatan Stok Rendah</h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-900">Semua produk stoknya mencukupi</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product: Product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-900">
                      Stok: {product.stock} / Min: {product.minStock}
                    </p>
                  </div>
                  <span className="text-red-600 text-sm font-medium">
                    Perlu Restock
                  </span>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-gray-900 text-center">
                  +{lowStockProducts.length - 5} produk lainnya perlu restock
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/transactions"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-blue-600 font-medium">Transaksi Baru</div>
            <div className="text-sm text-gray-900">Input penjualan</div>
          </a>
          <a
            href="/inventory"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-green-600 font-medium">Tambah Stok</div>
            <div className="text-sm text-gray-900">Input pembelian</div>
          </a>
          <a
            href="/reports"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-purple-600 font-medium">Lihat Laporan</div>
            <div className="text-sm text-gray-900">Analisis penjualan</div>
          </a>
        </div>
      </div>
    </div>
  );
}