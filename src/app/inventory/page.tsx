'use client';

import { useState, useEffect } from 'react';
import { fetchProducts, createProduct, createPurchase, deleteProduct } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'add-product' | 'purchase'>('products');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    supplier: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 10
  });

  const [newPurchase, setNewPurchase] = useState({
    productId: '',
    quantity: 0,
    costPrice: 0,
    supplier: ''
  });

  // State for stock update modal
  const [updateStockModal, setUpdateStockModal] = useState<{
    isOpen: boolean;
    product: Product | null;
    quantity: number;
    costPrice: number;
    supplier: string;
  }>({
    isOpen: false,
    product: null,
    quantity: 0,
    costPrice: 0,
    supplier: ''
  });

  useEffect(() => {
    setIsClient(true);
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await fetchProducts();
        setProducts(productsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load data immediately
    loadProducts();

    // Auto-refresh every 20 seconds for realtime inventory tracking
    const interval = setInterval(loadProducts, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createProduct(newProduct);
      const productsData = await fetchProducts();
      setProducts(productsData);
      setNewProduct({
        name: '',
        category: '',
        supplier: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 10
      });
      setActiveTab('products');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const selectedProduct = products.find(p => p.id === parseInt(newPurchase.productId));
      const purchaseData = {
        productId: newPurchase.productId,
        productName: selectedProduct?.name || '',
        quantity: newPurchase.quantity,
        price: newPurchase.costPrice, // Changed from cost to price
        total: newPurchase.quantity * newPurchase.costPrice,
        supplier: newPurchase.supplier
      };
      await createPurchase(purchaseData);
      
      // Force refresh products data with no-cache
      const productsData = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }).then(res => res.json());
      
      setProducts(productsData);
      setNewPurchase({
        productId: '',
        quantity: 0,
        costPrice: 0,
        supplier: ''
      });
      setActiveTab('products');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error adding purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    setIsLoading(true);
    try {
      await deleteProduct(id.toString());
      const productsData = await fetchProducts();
      setProducts(productsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateStockModal = (product: Product) => {
    setUpdateStockModal({
      isOpen: true,
      product,
      quantity: 0,
      costPrice: product.cost || 0,
      supplier: product.supplier || ''
    });
  };

  const closeUpdateStockModal = () => {
    setUpdateStockModal({
      isOpen: false,
      product: null,
      quantity: 0,
      costPrice: 0,
      supplier: ''
    });
  };

  const handleUpdateStock = async () => {
    if (!updateStockModal.product) return;
    
    setIsLoading(true);
    try {
      const purchaseData = {
        productId: updateStockModal.product.id.toString(),
        productName: updateStockModal.product.name,
        quantity: updateStockModal.quantity,
        price: updateStockModal.costPrice, // Changed from 'cost' to 'price' to match API
        total: updateStockModal.quantity * updateStockModal.costPrice,
        supplier: updateStockModal.supplier
      };
      
      const purchaseResponse = await createPurchase(purchaseData);
      console.log('Purchase created:', purchaseResponse);
      
      // Force refresh products data with no-cache
      const productsData = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }).then(res => res.json());
      
      setProducts(productsData);
      setLastUpdated(new Date());
      closeUpdateStockModal();
      
      // Show success message (optional)
      console.log(`Stock updated successfully! ${updateStockModal.product.name} stock increased by ${updateStockModal.quantity}`);
      
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Gagal mengupdate stok. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Stok</h1>
          <p className="text-slate-600">
            Kelola inventory, tambah produk baru, dan input pembelian dengan tracking real-time
          </p>
        </div>
        <div className="flex flex-col sm:items-end space-y-2">
          <div className="flex items-center space-x-3">
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            )}
            <div className="flex items-center px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs font-semibold text-green-700">Real-time</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Update: {lastUpdated.toLocaleTimeString('id-ID')}
          </div>
        </div>
      </div>

      {/* Professional Tabs */}
      <div className="bg-white rounded-2xl p-1 card-shadow-lg">
        <nav className="flex space-x-1">
          {[
            { key: 'products', label: 'Daftar Produk', icon: '📦' },
            { key: 'add-product', label: 'Tambah Produk', icon: '➕' },
            { key: 'purchase', label: 'Input Pembelian', icon: '🛒' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'products' | 'add-product' | 'purchase')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl card-shadow-lg">
          {/* Search Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Daftar Produk</h2>
                <p className="text-sm text-slate-600 mt-1">{filteredProducts.length} produk tersedia</p>
              </div>
              <div className="relative max-w-md w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari produk, kategori, atau supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Product Grid */}
          <div className="p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">
                  {searchTerm ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Tambah produk baru untuk memulai'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= (product.min_stock || 5);
                  const isOutOfStock = product.stock === 0;
                  
                  return (
                    <div
                      key={product.id}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        isOutOfStock
                          ? 'border-red-200 bg-red-50'
                          : isLowStock
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {/* Product Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-lg ${
                            isOutOfStock ? 'text-red-800' : 'text-slate-800'
                          } truncate`}>
                            {product.name}
                          </h3>
                          <p className={`text-sm ${
                            isOutOfStock ? 'text-red-600' : 'text-slate-600'
                          } mt-1`}>
                            {product.category}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Stok</span>
                          {isOutOfStock ? (
                            <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full">
                              Habis
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
                              Menipis
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                              Aman
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">
                          {product.stock}
                        </div>
                        <div className="text-sm text-slate-500">
                          Minimum: {product.min_stock || 5}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Harga Jual</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Harga Beli</span>
                          <span className="font-medium text-slate-700">
                            {formatCurrency(product.cost || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                          <span className="text-sm font-medium text-slate-700">Profit/Unit</span>
                          <span className={`font-semibold ${
                            (product.price - (product.cost || 0)) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(product.price - (product.cost || 0))}
                          </span>
                        </div>
                      </div>

                      {/* Supplier */}
                      <div className="text-sm text-slate-600 mb-4">
                        <span className="font-medium">Supplier:</span> {product.supplier || 'Tidak ada'}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => openUpdateStockModal(product)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isOutOfStock
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : isLowStock
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>{isOutOfStock ? 'Restok Sekarang' : 'Tambah Stok'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add-product' && (
        <div className="bg-white rounded-2xl p-8 card-shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Tambah Produk Baru</h2>
            <p className="text-slate-600">Masukkan detail produk untuk menambahkan ke inventory</p>
          </div>

          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Masukkan nama produk"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Masukkan kategori"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Masukkan supplier"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stok Awal *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga Beli (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga Jual (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stok Minimum
                </label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.minStock}
                  onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="5"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm font-medium text-slate-700 mb-1">Profit per Unit</div>
                  <div className={`text-lg font-bold ${
                    (newProduct.price - newProduct.cost) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(newProduct.price - newProduct.cost)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Tambah Produk</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchase Tab */}
      {activeTab === 'purchase' && (
        <div className="bg-white rounded-2xl p-8 card-shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Input Pembelian</h2>
            <p className="text-slate-600">Catat pembelian barang untuk menambah stok</p>
          </div>

          <form onSubmit={handleAddPurchase} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pilih Produk *
                </label>
                <select
                  required
                  value={newPurchase.productId}
                  onChange={(e) => setNewPurchase({...newPurchase, productId: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                >
                  <option value="">Pilih produk yang akan dibeli</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.category} (Stok: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jumlah *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPurchase.quantity}
                  onChange={(e) => setNewPurchase({...newPurchase, quantity: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga Beli per Unit (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newPurchase.costPrice}
                  onChange={(e) => setNewPurchase({...newPurchase, costPrice: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={newPurchase.supplier}
                  onChange={(e) => setNewPurchase({...newPurchase, supplier: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Nama supplier"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm font-medium text-slate-700 mb-1">Total Pembelian</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(newPurchase.quantity * newPurchase.costPrice)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Simpan Pembelian</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Update Modal */}
      {updateStockModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Update Stok - {updateStockModal.product?.name}
              </h3>
              <button
                onClick={closeUpdateStockModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600">Stok Saat Ini</div>
              <div className="text-xl font-bold text-slate-800">
                {updateStockModal.product?.stock} unit
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jumlah Tambahan *
                </label>
                <input
                  type="number"
                  min="1"
                  value={updateStockModal.quantity}
                  onChange={(e) => setUpdateStockModal(prev => ({
                    ...prev,
                    quantity: Number(e.target.value)
                  }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Masukkan jumlah yang ingin ditambah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga Beli per Unit (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={updateStockModal.costPrice}
                  onChange={(e) => setUpdateStockModal(prev => ({
                    ...prev,
                    costPrice: Number(e.target.value)
                  }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Harga beli per unit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={updateStockModal.supplier}
                  onChange={(e) => setUpdateStockModal(prev => ({
                    ...prev,
                    supplier: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  placeholder="Nama supplier (opsional)"
                />
              </div>

              {updateStockModal.quantity > 0 && updateStockModal.costPrice > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-700">Stok Baru:</span>
                    <span className="font-bold text-blue-800">
                      {(updateStockModal.product?.stock || 0) + updateStockModal.quantity} unit
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Total Biaya:</span>
                    <span className="font-bold text-blue-800">
                      {formatCurrency(updateStockModal.quantity * updateStockModal.costPrice)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeUpdateStockModal}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={isLoading || updateStockModal.quantity <= 0 || updateStockModal.costPrice <= 0}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Stok</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}