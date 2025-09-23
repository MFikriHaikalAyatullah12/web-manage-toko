'use client';

import { useState, useEffect } from 'react';
import { fetchChartData, fetchDashboardStats, fetchProducts, fetchTransactions } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ChartData, Product, Transaction, DashboardStats } from '@/types';

// Simple Bar Chart Component
const BarChart = ({ data, title }: { data: ChartData[]; title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
    <div className="h-64">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.sales));
          const height = maxValue > 0 ? (item.sales / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-900 mb-1">
                {formatCurrency(item.sales)}
              </div>
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '2px' }}
                title={`${item.date}: ${formatCurrency(item.sales)}`}
              />
              <div className="text-xs text-gray-900 mt-1">{item.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// Profit Chart Component
const ProfitChart = ({ data, title }: { data: ChartData[]; title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
    <div className="h-64">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => Math.abs(d.profit)));
          const height = maxValue > 0 ? (Math.abs(item.profit) / maxValue) * 100 : 0;
          const isProfit = item.profit >= 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-900 mb-1">
                {formatCurrency(item.profit)}
              </div>
              <div 
                className={`w-full rounded-t transition-all duration-300 ${
                  isProfit ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
                style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '2px' }}
                title={`${item.date}: ${formatCurrency(item.profit)}`}
              />
              <div className="text-xs text-gray-900 mt-1">{item.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// Top Products Component
const TopProducts = ({ transactions }: { transactions: Transaction[] }) => {
  const productSales = transactions.reduce((acc, transaction) => {
    transaction.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.total;
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-900">{product.quantity} terjual</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(product.revenue)}</p>
              <p className="text-sm text-gray-900">#{index + 1}</p>
            </div>
          </div>
        ))}
        {topProducts.length === 0 && (
          <p className="text-gray-900 text-center py-4">Belum ada data penjualan</p>
        )}
      </div>
    </div>
  );
};

// Low Stock Alert Component
const LowStockAlert = ({ products }: { products: Product[] }) => {
  const lowStockProducts = products
    .filter(p => p.stock <= p.minStock)
    .sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Peringatan Stok</h3>
      <div className="space-y-3">
        {lowStockProducts.slice(0, 5).map((product) => {
          const stockPercentage = (product.stock / product.minStock) * 100;
          const alertLevel = stockPercentage <= 0 ? 'critical' : stockPercentage <= 50 ? 'warning' : 'low';
          
          const alertColors = {
            critical: 'bg-red-100 border-red-500 text-red-800',
            warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
            low: 'bg-orange-100 border-orange-500 text-orange-800',
          };

          return (
            <div key={product.id} className={`p-3 border-l-4 rounded-lg ${alertColors[alertLevel]}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-900">
                    Stok: {product.stock} / Min: {product.minStock}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium">
                    {product.stock <= 0 ? 'HABIS' : 'RENDAH'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {lowStockProducts.length === 0 && (
          <p className="text-green-600 text-center py-4">✓ Semua produk stoknya mencukupi</p>
        )}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [salesData, setSalesData] = useState<ChartData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [chartData, allProducts, allTransactions, dashboardStats] = await Promise.all([
          fetchChartData(),
          fetchProducts(),
          fetchTransactions(),
          fetchDashboardStats()
        ]);

        setSalesData(chartData);
        setProducts(allProducts);
        setTransactions(allTransactions);
        setStats(dashboardStats);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load data immediately
    loadData();
    
    // Set up auto-refresh every 45 seconds for analytics
    const interval = setInterval(loadData, 45000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [period]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-900">Memuat analisis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisis Bisnis</h1>
          <p className="text-gray-900">Insight mendalam tentang performa toko Anda</p>
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
            Auto-refresh setiap 45 detik
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Overview Performa</h2>
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value) as 7 | 30)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value={7}>7 Hari Terakhir</option>
            <option value={30}>30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-medium">Total Penjualan</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalSales)}</p>
          <p className="text-blue-100">Semua waktu</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-medium">Total Keuntungan</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalProfit)}</p>
          <p className="text-green-100">+{stats.monthlyGrowth}% bulan ini</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-medium">Rata-rata Transaksi</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(transactions.length > 0 && stats.totalSales > 0 
              ? stats.totalSales / transactions.length 
              : 0)}
          </p>
          <p className="text-purple-100">Per transaksi</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-medium">Margin Keuntungan</h3>
          <p className="text-3xl font-bold">
            {(stats.totalSales > 0 && stats.totalProfit !== null && !isNaN(stats.totalProfit)) 
              ? ((stats.totalProfit / stats.totalSales) * 100).toFixed(1) 
              : '0'}%
          </p>
          <p className="text-orange-100">Profit margin</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={salesData} title="Penjualan 7 Hari Terakhir" />
        <ProfitChart data={salesData} title="Keuntungan 7 Hari Terakhir" />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts transactions={transactions} />
        <LowStockAlert products={products} />
      </div>

      {/* Business Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Insight Bisnis</h3>
        <div className="space-y-4">
          {stats.totalProfit > 0 && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <h4 className="font-medium text-green-800">✓ Performa Positif</h4>
              <p className="text-green-700">
                Bisnis Anda menguntungkan dengan profit {formatCurrency(stats.totalProfit)}
              </p>
            </div>
          )}
          
          {stats.lowStockItems > 0 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <h4 className="font-medium text-yellow-800">⚠ Perhatian Stok</h4>
              <p className="text-yellow-700">
                {stats.lowStockItems} produk perlu direstock untuk menghindari kehabisan stok
              </p>
            </div>
          )}
          
          {transactions.length === 0 && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <h4 className="font-medium text-blue-800">📈 Mulai Berbisnis</h4>
              <p className="text-blue-700">
                Mulai input transaksi penjualan untuk melihat analisis yang lebih detail
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}