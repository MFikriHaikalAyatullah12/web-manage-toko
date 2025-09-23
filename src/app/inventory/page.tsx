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

  useEffect(() => {
    setIsClient(true);
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();

    // Auto-refresh every 90 seconds
    const interval = setInterval(loadProducts, 90000);
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
      const selectedProduct = products.find(p => p.id === newPurchase.productId);
      const purchaseData = {
        productId: newPurchase.productId,
        productName: selectedProduct?.name || '',
        quantity: newPurchase.quantity,
        cost: newPurchase.costPrice,
        total: newPurchase.quantity * newPurchase.costPrice,
        supplier: newPurchase.supplier
      };
      await createPurchase(purchaseData);
      const productsData = await fetchProducts();
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

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
        const productsData = await fetchProducts();
        setProducts(productsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Stok</h1>
          <p className="text-gray-900">Kelola produk dan stok inventori</p>
          <p className="text-sm text-gray-900 mt-1">
            Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daftar Produk
            </button>
            <button
              onClick={() => setActiveTab('add-product')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'add-product'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tambah Produk
            </button>
            <button
              onClick={() => setActiveTab('purchase')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'purchase'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tambah Pembelian
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <div className="text-sm text-gray-900">
                  Total: {filteredProducts.length} produk
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-900">
                            {product.supplier}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock} / min: {product.minStock}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock <= 0 
                              ? 'bg-red-100 text-red-800' 
                              : product.stock <= product.minStock
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.stock <= 0 ? 'Habis' : product.stock <= product.minStock ? 'Rendah' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add-product' && (
            <form onSubmit={handleAddProduct} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tambah Produk Baru</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Harga Jual
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Harga Beli
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Stok Minimum
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Menambahkan...' : 'Tambah Produk'}
              </button>
            </form>
          )}

          {activeTab === 'purchase' && (
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tambah Pembelian</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Produk
                  </label>
                  <select
                    required
                    value={newPurchase.productId}
                    onChange={(e) => setNewPurchase({...newPurchase, productId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Pilih Produk</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    required
                    value={newPurchase.quantity}
                    onChange={(e) => setNewPurchase({...newPurchase, quantity: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Harga Beli Satuan
                  </label>
                  <input
                    type="number"
                    required
                    value={newPurchase.costPrice}
                    onChange={(e) => setNewPurchase({...newPurchase, costPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    required
                    value={newPurchase.supplier}
                    onChange={(e) => setNewPurchase({...newPurchase, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              {newPurchase.quantity > 0 && newPurchase.costPrice > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">
                    Total Pembelian: {formatCurrency(newPurchase.quantity * newPurchase.costPrice)}
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Menambahkan...' : 'Tambah Pembelian'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}