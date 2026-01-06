'use client';

import { useState, useEffect } from 'react';
import { fetchChartData, fetchDashboardStats, fetchProducts, fetchTransactions } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ChartData, Product, Transaction, DashboardStats } from '@/types';

// Simple Bar Chart Component
const BarChart = ({ data, title }: { data: ChartData[]; title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
    <div className="h-64">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data && data.length > 0 ? data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.sales).filter(s => !isNaN(s) && s > 0));
          const itemSales = isNaN(item.sales) ? 0 : item.sales;
          const height = maxValue > 0 && itemSales > 0 ? (itemSales / maxValue) * 100 : 0;
          const safeHeight = isNaN(height) ? 0 : Math.max(0, Math.min(100, height));
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-black mb-1">
                {formatCurrency(itemSales)}
              </div>
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${safeHeight}%`, minHeight: safeHeight > 0 ? '8px' : '2px' }}
                title={`${item.date}: ${formatCurrency(itemSales)}`}
              />
              <div className="text-xs text-black mt-1">{item.date}</div>
            </div>
          );
        }) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-black">Tidak ada data untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Profit Chart Component
const ProfitChart = ({ data, title }: { data: ChartData[]; title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
    <div className="h-64">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data && data.length > 0 ? data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => Math.abs(d.profit)).filter(p => !isNaN(p) && p > 0));
          const itemProfit = isNaN(item.profit) ? 0 : item.profit;
          const absProfit = Math.abs(itemProfit);
          const height = maxValue > 0 && absProfit > 0 ? (absProfit / maxValue) * 100 : 0;
          const safeHeight = isNaN(height) ? 0 : Math.max(0, Math.min(100, height));
          const isProfit = itemProfit >= 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-black mb-1">
                {formatCurrency(itemProfit)}
              </div>
              <div 
                className={`w-full rounded-t transition-all duration-300 ${
                  isProfit ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
                style={{ height: `${safeHeight}%`, minHeight: safeHeight > 0 ? '8px' : '2px' }}
                title={`${item.date}: ${formatCurrency(itemProfit)}`}
              />
              <div className="text-xs text-black mt-1">{item.date}</div>
            </div>
          );
        }) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-black">Tidak ada data untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Top Products Component
const TopProducts = ({ transactions }: { transactions: Transaction[] }) => {
  const productSales = transactions.reduce((acc, transaction) => {
    if (transaction.items && Array.isArray(transaction.items)) {
      transaction.items.forEach(item => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        const quantity = isNaN(item.quantity) ? 0 : item.quantity;
        const total = isNaN(item.total) ? 0 : item.total;
        
        acc[item.productId].quantity += quantity;
        acc[item.productId].revenue += total;
      });
    }
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
              <h4 className="font-medium text-black">{product.name}</h4>
              <p className="text-sm text-black">{product.quantity} terjual</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(product.revenue)}</p>
              <p className="text-sm text-black">#{index + 1}</p>
            </div>
          </div>
        ))}
        {topProducts.length === 0 && (
          <p className="text-black text-center py-4">Belum ada data penjualan</p>
        )}
      </div>
    </div>
  );
};

// Low Stock Alert Component
const LowStockAlert = ({ products }: { products: Product[] }) => {
  const lowStockProducts = products
    .filter(p => p.stock <= (p.min_stock || 5))
    .sort((a, b) => (a.stock / (a.min_stock || 5)) - (b.stock / (b.min_stock || 5)));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Peringatan Stok</h3>
      <div className="space-y-3">
        {lowStockProducts.slice(0, 5).map((product) => {
          const stock = isNaN(product.stock) ? 0 : product.stock;
          const minStockValue = product.min_stock ?? 5; // Use nullish coalescing to handle undefined
          const minStock = isNaN(minStockValue) ? 5 : Math.max(1, minStockValue);
          const stockPercentage = (stock / minStock) * 100;
          const safePercentage = isNaN(stockPercentage) ? 0 : stockPercentage;
          const alertLevel = safePercentage <= 0 ? 'critical' : safePercentage <= 50 ? 'warning' : 'low';
          
          const alertColors = {
            critical: 'bg-red-100 border-red-500 text-red-800',
            warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
            low: 'bg-orange-100 border-orange-500 text-orange-800',
          };

          return (
            <div key={product.id} className={`p-3 border-l-4 rounded-lg ${alertColors[alertLevel]}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-black">{product.name}</h4>
                  <p className="text-sm text-black">
                    Stok: {product.stock} / Min: {product.min_stock || 5}
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
  const [period, setPeriod] = useState<7 | 30>(30);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [chartData, allProducts, allTransactions, dashboardStats] = await Promise.all([
          fetchChartData(period), // Pass period parameter for realtime chart update
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
    
    // Load data immediately when period changes
    loadData();
    
    // Set up more frequent auto-refresh for realtime experience (every 15 seconds)
    const interval = setInterval(() => {
      loadData(); // This will use the current period value
    }, 15000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [period]); // Dependency on period ensures chart updates when period changes

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-black">Memuat analisis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Analisis Bisnis</h1>
          <p className="text-black">Insight mendalam tentang performa toko Anda</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <span className="text-sm text-black">
              Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          </div>
          <div className="text-xs text-black mt-1">
            Auto-refresh setiap 15 detik
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Overview Performa</h2>
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value) as 7 | 30)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value={30}>1 Bulan Terakhir</option>
            <option value={7}>7 Hari Terakhir</option>
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
          <p className="text-3xl font-bold">{formatCurrency(stats.profit || 0)}</p>
          <p className="text-green-100">Profit bersih</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-medium">Rata-rata Transaksi</h3>
          <p className="text-3xl font-bold">
            {(() => {
              if (!transactions.length || !stats.totalSales || stats.totalSales <= 0) return formatCurrency(0);
              const average = stats.totalSales / transactions.length;
              return formatCurrency(isNaN(average) ? 0 : average);
            })()}
          </p>
          <p className="text-purple-100">Per transaksi</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-medium">Margin Keuntungan</h3>
          <p className="text-3xl font-bold">
            {(() => {
              if (!stats.totalSales || stats.totalSales <= 0 || 
                  stats.profit === null || stats.profit === undefined || 
                  isNaN(stats.profit)) {
                return '0.0';
              }
              const margin = (stats.profit / stats.totalSales) * 100;
              return isNaN(margin) ? '0.0' : margin.toFixed(1);
            })()}%
          </p>
          <p className="text-orange-100">Profit margin</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={salesData} title={`Penjualan ${period} Hari Terakhir`} />
        <ProfitChart data={salesData} title={`Keuntungan ${period} Hari Terakhir`} />
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
          {stats.profit > 0 && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <h4 className="font-medium text-green-800">✓ Performa Positif</h4>
              <p className="text-green-700">
                Bisnis Anda menguntungkan dengan profit {formatCurrency(stats.profit)}
              </p>
            </div>
          )}
          
          {stats.lowStockProducts > 0 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <h4 className="font-medium text-yellow-800">⚠ Perhatian Stok</h4>
              <p className="text-yellow-700">
                {stats.lowStockProducts} produk perlu direstock untuk menghindari kehabisan stok
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