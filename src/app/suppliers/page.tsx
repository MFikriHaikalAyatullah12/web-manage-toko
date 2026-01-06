'use client';

import { useState, useEffect } from 'react';
import type { Supplier } from '@/types';

interface SupplierWithStats extends Supplier {
  product_count?: number;
  purchase_count?: number;
  total_purchases?: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierWithStats[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.phone?.includes(searchTerm))
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/suppliers/${editingId}` : '/api/suppliers';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchSuppliers();
        resetForm();
      } else {
        alert(data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Gagal menyimpan supplier');
    }
  };

  const handleEdit = (supplier: SupplierWithStats) => {
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || ''
    });
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus supplier ini?')) return;

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchSuppliers();
      } else {
        alert(data.error || 'Gagal menghapus supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Gagal menghapus supplier');
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`);
      const data = await response.json();
      setViewingSupplier(data);
      // Disable body scroll when modal opens
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      alert('Gagal mengambil detail supplier');
    }
  };

  const closeViewModal = () => {
    setViewingSupplier(null);
    // Re-enable body scroll when modal closes
    document.body.style.overflow = 'unset';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data supplier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Supplier</h1>
        <p className="text-slate-600">Kelola database supplier dan lihat riwayat pembelian</p>
      </div>

      {/* Search and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari supplier (nama, kontak, telepon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          {showForm ? 'Batal' : '+ Tambah Supplier'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {editingId ? 'Edit Supplier' : 'Tambah Supplier Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Supplier *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Alamat
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                {editingId ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-semibold"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{supplier.name}</h3>
                {supplier.contact_person && (
                  <p className="text-sm text-slate-600">{supplier.contact_person}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Hapus"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {supplier.phone && (
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center text-sm text-slate-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {supplier.email}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold">Produk</p>
                <p className="text-lg font-bold text-blue-700">{supplier.product_count || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-semibold">Pembelian</p>
                <p className="text-lg font-bold text-green-700">{supplier.purchase_count || 0}</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg mb-4">
              <p className="text-xs text-purple-600 font-semibold mb-1">Total Pembelian</p>
              <p className="text-lg font-bold text-purple-700">
                {formatCurrency(Number(supplier.total_purchases) || 0)}
              </p>
            </div>

            <button
              onClick={() => handleViewDetails(supplier.id)}
              className="w-full px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
            >
              Lihat Detail & Riwayat
            </button>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold">Tidak ada supplier ditemukan</p>
          <p className="text-slate-500 text-sm">Mulai tambahkan supplier baru</p>
        </div>
      )}

      {/* Detail Modal */}
      {viewingSupplier && (
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={closeViewModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{viewingSupplier.supplier.name}</h2>
                  <p className="text-purple-100">{viewingSupplier.supplier.contact_person}</p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Contact Info */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-3">Informasi Kontak</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {viewingSupplier.supplier.phone && (
                    <div>
                      <p className="text-xs text-slate-500">Telepon</p>
                      <p className="font-semibold text-slate-700">{viewingSupplier.supplier.phone}</p>
                    </div>
                  )}
                  {viewingSupplier.supplier.email && (
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-semibold text-slate-700">{viewingSupplier.supplier.email}</p>
                    </div>
                  )}
                  {viewingSupplier.supplier.address && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-500">Alamat</p>
                      <p className="font-semibold text-slate-700">{viewingSupplier.supplier.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">Produk dari Supplier</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Produk</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Kategori</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700">Stok</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700">Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingSupplier.products.map((product: any) => (
                        <tr key={product.id} className="border-b border-slate-200">
                          <td className="px-4 py-2 text-sm">{product.name}</td>
                          <td className="px-4 py-2 text-sm">{product.category}</td>
                          <td className="px-4 py-2 text-sm text-right">{product.stock}</td>
                          <td className="px-4 py-2 text-sm text-right">{formatCurrency(product.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {viewingSupplier.products.length === 0 && (
                    <p className="text-center text-slate-500 py-4 text-sm">Belum ada produk</p>
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Riwayat Pembelian (50 Terakhir)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Tanggal</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Produk</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingSupplier.purchases.map((purchase: any) => (
                        <tr key={purchase.id} className="border-b border-slate-200">
                          <td className="px-4 py-2 text-sm">
                            {new Date(purchase.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-2 text-sm">{purchase.product_name}</td>
                          <td className="px-4 py-2 text-sm text-right">
                            {purchase.quantity} {purchase.unit || 'pcs'}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-semibold">
                            {formatCurrency(purchase.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {viewingSupplier.purchases.length === 0 && (
                    <p className="text-center text-slate-500 py-4 text-sm">Belum ada riwayat pembelian</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
