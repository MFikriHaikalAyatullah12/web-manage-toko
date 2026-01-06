'use client';

import { useState, useEffect } from 'react';
import { fetchTransactions, fetchPurchases } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction, Purchase } from '@/types';
import { ReceiptPrint } from '@/components/ReceiptPrint';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export-excel');
      
      if (!response.ok) {
        throw new Error('Failed to export Excel');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Toko_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Laporan Excel berhasil di-download!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Gagal mengexport laporan Excel. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Laporan Keuangan</h1>
          <p className="text-slate-900">Analisis penjualan dan pembelian real-time</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Excel</span>
              </>
            )}
          </button>

          <div className="text-right">
            <div className="flex items-center space-x-2">
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              )}
              <div className="flex items-center px-2.5 py-1 bg-green-100 rounded-full">
                <div className="status-dot status-online mr-1.5"></div>
                <span className="text-xs font-semibold text-green-700">Live</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Update: {lastUpdated.toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-semibold text-xs sm:text-sm transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              📊 Penjualan
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-semibold text-xs sm:text-sm transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'purchases'
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              🛒 Pembelian
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'sales' && (
            <div>
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-semibold text-amber-800">
                  Riwayat Penjualan ({transactions.length} transaksi)
                </h3>
              </div>
              
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xs text-amber-600">{formatDate(transaction.date)}</div>
                        <div className="text-sm font-bold text-amber-800">{formatCurrency(transaction.total)}</div>
                        <div className="text-xs text-amber-700 capitalize mt-1">{transaction.paymentMethod}</div>
                      </div>
                      <ReceiptPrint transaction={transaction} />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Aksi
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
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <ReceiptPrint transaction={transaction} />
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
                <h3 className="text-base md:text-lg font-semibold text-amber-800">
                  Riwayat Pembelian ({purchases.length} pembelian)
                </h3>
              </div>
              
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-amber-800">{purchase.productName}</div>
                        <div className="text-xs text-amber-600 mt-1">{formatDate(purchase.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-800">{formatCurrency(purchase.price)}</div>
                        <div className="text-xs text-amber-600 mt-1">{purchase.quantity} unit</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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