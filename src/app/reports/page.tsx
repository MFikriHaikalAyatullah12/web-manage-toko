'use client';

import { useState, useEffect } from 'react';
import { fetchTransactions, fetchPurchases } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction, Purchase } from '@/types';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'sales' | 'purchases'>('summary');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [transactionsData, purchasesData] = await Promise.all([
          fetchTransactions(),
          fetchPurchases()
        ]);
        setTransactions(transactionsData);
        setPurchases(purchasesData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const summary = {
    totalSales: transactions.reduce((sum, t) => {
      const total = isNaN(t.total) ? 0 : t.total;
      return sum + total;
    }, 0),
    totalPurchases: purchases.reduce((sum, p) => {
      const total = isNaN(p.total) ? 0 : p.total;
      return sum + total;
    }, 0),
    transactionCount: transactions.length,
    purchaseCount: purchases.length,
    get profit() {
      return this.totalSales - this.totalPurchases;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-900">Analisis penjualan dan pembelian</p>
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
            Auto-refresh setiap 60 detik
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Penjualan
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pembelian
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900">Total Penjualan</h3>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalSales)}</p>
                <p className="text-sm text-blue-700">{summary.transactionCount} transaksi</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900">Total Pembelian</h3>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalPurchases)}</p>
                <p className="text-sm text-orange-700">{summary.purchaseCount} pembelian</p>
              </div>
              
              <div className={`p-4 rounded-lg ${summary.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`text-lg font-semibold ${summary.profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  Keuntungan
                </h3>
                <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.profit)}
                </p>
                <p className={`text-sm ${summary.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Penjualan - Pembelian
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900">Rata-rata Transaksi</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {(() => {
                    if (summary.transactionCount <= 0 || summary.totalSales <= 0) {
                      return formatCurrency(0);
                    }
                    const average = summary.totalSales / summary.transactionCount;
                    return formatCurrency(isNaN(average) ? 0 : average);
                  })()}
                </p>
                <p className="text-sm text-purple-700">Per transaksi</p>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Riwayat Penjualan ({transactions.length} transaksi)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Pembayaran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.total)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Riwayat Pembelian ({purchases.length} pembelian)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Supplier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(purchase.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {purchase.productName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(purchase.total)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase.supplier}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}