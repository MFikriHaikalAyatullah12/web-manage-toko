'use client';

import { useState, useEffect } from 'react';
import { fetchTransactions, fetchPurchases } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction, Purchase } from '@/types';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
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
    const interval = setInterval(loadData, 25000); // 25 detik untuk reports
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-amber-800">Laporan Keuangan</h1>
          <p className="text-amber-700">Analisis penjualan dan pembelian real-time</p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
            )}
            <div className="flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              Reports Live
            </div>
          </div>
          <div className="text-xs text-amber-600 mt-1">
            Update: {lastUpdated.toLocaleTimeString('id-ID')}
          </div>
          <div className="text-xs text-amber-500 mt-0.5">
            Auto-refresh 25 detik
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-amber-700 hover:text-amber-800 hover:border-amber-300'
              }`}
            >
              Penjualan
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-amber-700 hover:text-amber-800 hover:border-amber-300'
              }`}
            >
              Pembelian
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'sales' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-amber-800">
                  Riwayat Penjualan ({transactions.length} transaksi)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Pembayaran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-amber-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-700">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-amber-800">
                          {formatCurrency(transaction.total)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-700">
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
                <h3 className="text-lg font-semibold text-amber-800">
                  Riwayat Pembelian ({purchases.length} pembelian)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Supplier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-200">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-amber-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-700">
                          {formatDate(purchase.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-amber-800">
                          {purchase.productName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-700">
                          {purchase.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-amber-800">
                          {formatCurrency(purchase.total)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-700">
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