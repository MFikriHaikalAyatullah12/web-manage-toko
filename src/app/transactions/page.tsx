'use client';

import { useState, useEffect } from 'react';
import { fetchProducts, createTransaction } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Product, TransactionItem } from '@/types';

export default function TransactionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashierName, setCashierName] = useState('Admin');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
    
    // Load products immediately
    loadProducts();
    
    // Set up auto-refresh every 30 seconds for realtime stock updates
    const interval = setInterval(loadProducts, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    
    // Check if adding one more item would exceed available stock
    if (currentQuantityInCart >= product.stock) {
      alert(`Stok tidak mencukupi! Stok tersedia untuk ${product.name}: ${product.stock}`);
      return;
    }
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: TransactionItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        cost: product.cost,
        total: product.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }
    
    // Find the product to check stock availability
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      alert(`Stok tidak mencukupi! Stok tersedia untuk ${product.name}: ${product.stock}`);
      return;
    }
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    setIsProcessing(true);

    try {
      const transaction = {
        items: cart,
        subtotal: calculateSubtotal(),
        tax: 0, // No tax applied
        discount,
        total: calculateTotal(),
        cashierId: '1',
        cashierName,
        paymentMethod,
      };

      const result = await createTransaction(transaction);
      
      if (result) {
        // Reset form
        setCart([]);
        setDiscount(0);
        
        // Refresh products to show updated stock
        const updatedProducts = await fetchProducts();
        setProducts(updatedProducts);

        alert('Transaksi berhasil disimpan!');
      } else {
        alert('Gagal menyimpan transaksi');
      }
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat memproses transaksi';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const errorObj = error as { response?: { data?: { error?: string } } };
        if (errorObj.response?.data?.error) {
          errorMessage = errorObj.response.data.error;
        }
      }
      
      alert(errorMessage);
      console.error('Transaction error:', error);
      
      // Refresh products to get updated stock after failed transaction
      try {
        const updatedProducts = await fetchProducts();
        setProducts(updatedProducts);
      } catch (refreshError) {
        console.error('Error refreshing products:', refreshError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Transaksi Penjualan</h1>
          <p className="text-slate-900">
            Input penjualan produk dengan stok real-time dan validasi otomatis
          </p>
        </div>
        <div className="flex flex-col sm:items-end space-y-2">
          <div className="flex items-center space-x-3">
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            )}
            <div className="flex items-center px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs font-semibold text-green-700">Stok Real-time</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Product Selection - Takes 2 columns */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 md:p-6 card-shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">Pilih Produk</h2>
              <p className="text-xs md:text-sm text-slate-600 mt-1">Klik produk untuk menambah ke keranjang</p>
            </div>
            <div className="text-xs md:text-sm text-slate-500">
              {filteredProducts.length} produk tersedia
            </div>
          </div>
          
          {/* Enhanced Search */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 text-sm md:text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Professional Product Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[400px] md:max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => {
              const cartQuantity = cart.find(item => item.productId === product.id)?.quantity || 0;
              const isOutOfStock = product.stock <= 0;
              const isMaxQuantity = cartQuantity >= product.stock;
              
              return (
                <div
                  key={product.id}
                  className={`group p-3 md:p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                    isOutOfStock 
                      ? 'border-red-200 bg-red-50 cursor-not-allowed' 
                      : isMaxQuantity
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50'
                  }`}
                  onClick={() => !isOutOfStock && !isMaxQuantity && addToCart(product)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm ${isOutOfStock ? 'text-red-700' : 'text-slate-800'} truncate`}>
                        {product.name}
                      </h3>
                      <p className={`text-xs mt-1 ${isOutOfStock ? 'text-red-600' : 'text-slate-600'}`}>
                        {product.category}
                      </p>
                    </div>
                    {cartQuantity > 0 && (
                      <div className="flex-shrink-0 ml-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cartQuantity}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(product.price)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${
                          product.stock <= 5 ? 'text-orange-600 font-medium' : 'text-slate-500'
                        }`}>
                          Stok: {product.stock}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                            Terbatas
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isOutOfStock 
                          ? 'bg-red-200 text-red-700 cursor-not-allowed' 
                          : isMaxQuantity
                            ? 'bg-orange-200 text-orange-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 group-hover:bg-blue-700'
                      }`}
                      disabled={isOutOfStock || isMaxQuantity}
                    >
                      {isOutOfStock ? 'Habis' : isMaxQuantity ? 'Max' : 'Tambah'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Professional Cart - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-4 md:p-6 card-shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">Keranjang</h2>
              <p className="text-xs md:text-sm text-slate-600 mt-1">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs md:text-sm text-red-600 hover:text-red-700 font-medium min-h-[44px] px-3"
              >
                Kosongkan
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                </svg>
              </div>
              <p className="text-sm md:text-base text-slate-600 font-medium">Keranjang kosong</p>
              <p className="text-xs md:text-sm text-slate-500 mt-1">Tambahkan produk untuk memulai transaksi</p>
            </div>
          ) : (
            <>
              {/* Cart Items - Touch Optimized */}
              <div className="space-y-3 mb-6 max-h-[350px] md:max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 text-xs md:text-sm truncate">{item.productName}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center text-xs md:text-sm font-bold text-slate-800 ml-4">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={(products.find(p => p.id === item.productId)?.stock || 0) <= item.quantity}
                          className="w-7 h-7 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction Details */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kasir
                    </label>
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Metode Pembayaran
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'transfer')}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                    >
                      <option value="cash">💰 Tunai</option>
                      <option value="card">💳 Kartu</option>
                      <option value="transfer">📱 Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                      min="0"
                      max={calculateSubtotal()}
                    />
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium text-slate-800">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Diskon:</span>
                      <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                    <span className="text-slate-800">Total:</span>
                    <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                {/* Process Button */}
                <button
                  onClick={processTransaction}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Proses Transaksi</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}