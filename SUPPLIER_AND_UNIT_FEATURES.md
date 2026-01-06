# Fitur Baru: Manajemen Supplier & Satuan Unit

## 🎉 Fitur yang Ditambahkan

### 1. **Manajemen Supplier** 👨‍💼

Halaman baru untuk mengelola database supplier dengan fitur lengkap:

#### Fitur Utama:
- ✅ **CRUD Supplier** - Tambah, Edit, Hapus supplier
- ✅ **Database Kontak Lengkap**
  - Nama supplier
  - Contact person
  - Telepon
  - Email
  - Alamat
  - Catatan
  
- ✅ **Statistik Real-time**
  - Jumlah produk dari supplier
  - Jumlah transaksi pembelian
  - Total nilai pembelian
  
- ✅ **Riwayat Pembelian**
  - Lihat semua pembelian dari supplier
  - Filter dan pencarian
  - Daftar produk dari supplier

- ✅ **Integrasi dengan Produk**
  - Link produk ke supplier
  - Tracking supplier per produk
  
#### Cara Menggunakan:
1. Buka menu **Supplier** di sidebar
2. Klik **+ Tambah Supplier** untuk menambah supplier baru
3. Isi detail kontak supplier
4. Klik **Lihat Detail & Riwayat** untuk melihat riwayat pembelian

---

### 2. **Satuan Unit (Pcs/Box)** 📦

Sistem baru untuk mendukung input stok dalam satuan berbeda dengan konversi otomatis:

#### Fitur Utama:
- ✅ **Pilihan Satuan** - Pcs (satuan) atau Box/Dus
- ✅ **Konversi Otomatis** - Input box otomatis dikonversi ke pcs
- ✅ **Konfigurasi Box Quantity** - Tentukan jumlah pcs per box
- ✅ **Kalkulasi Real-time** - Total stok dan biaya dihitung otomatis

#### Cara Menggunakan:

##### Di **Tambah Produk Baru:**
1. Buka tab **Tambah Produk** di Manajemen Stok
2. Pilih **Satuan Unit**: Pcs atau Box
3. Jika pilih Box, masukkan **Jumlah Pcs per Box** (contoh: 12)
4. Sistem akan menyimpan konfigurasi box quantity untuk produk tersebut

##### Di **Input Pembelian:**
1. Buka tab **Input Pembelian**
2. Pilih produk yang akan dibeli
3. Masukkan jumlah
4. Pilih **Satuan**: Pcs atau Box
5. Jika pilih Box, sistem akan menampilkan konversi:
   - "1 box = 12 pcs (Total: 60 pcs)" untuk 5 box
6. Total pembelian dan stok akan dihitung otomatis dalam pcs

##### Di **Update Stok (Modal):**
1. Klik **Tambah Stok** pada produk
2. Masukkan jumlah tambahan
3. Pilih **Satuan**: Pcs atau Box
4. Lihat preview stok baru dan total biaya
5. Sistem otomatis mengkonversi box ke pcs

#### Contoh Penggunaan:
```
Produk: Susu UHT
Satuan: Box
Box Quantity: 12 pcs per box

Input Pembelian:
- Jumlah: 5
- Satuan: Box
- Harga per pcs: Rp 5.000

Hasil:
- Stok bertambah: 60 pcs (5 box × 12 pcs)
- Total biaya: Rp 300.000 (60 pcs × Rp 5.000)
```

---

## 📊 Perubahan Database Schema

### Tabel Baru:
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Field Baru di `products`:
```sql
ALTER TABLE products ADD COLUMN unit VARCHAR(20) DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN box_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id);
```

### Field Baru di `purchases`:
```sql
ALTER TABLE purchases ADD COLUMN unit VARCHAR(20) DEFAULT 'pcs';
ALTER TABLE purchases ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id);
```

---

## 🚀 Cara Setup (Reset Database)

Untuk menerapkan schema baru, Anda perlu reset database:

### Opsi 1: Via Web Interface
1. Buka `/setup` di browser
2. Klik tombol **"Reset Database (Hapus Semua Data)"**
3. Konfirmasi penghapusan
4. Database akan di-setup ulang dengan schema baru

### Opsi 2: Via Terminal
```bash
npm run db:reset
```

⚠️ **PERINGATAN**: Reset akan menghapus SEMUA data lama (produk, transaksi, pembelian)

---

## 📱 Navigasi Menu Baru

Menu **Supplier** telah ditambahkan di sidebar dengan urutan:
1. Dashboard
2. Transaksi Penjualan
3. Manajemen Stok
4. **Supplier** ← Baru!
5. Laporan
6. Analisis

---

## 🎯 Manfaat Fitur Baru

### Manajemen Supplier:
- ✅ Database kontak supplier terorganisir
- ✅ Tracking pembelian per supplier
- ✅ Analisis spending per supplier
- ✅ Mudah kontak supplier saat restock

### Satuan Unit:
- ✅ Input lebih fleksibel (pcs atau box)
- ✅ Memudahkan untuk produk yang dijual dalam kemasan
- ✅ Konversi otomatis mengurangi kesalahan hitung
- ✅ Tracking lebih akurat untuk produk bulk

---

## 💡 Tips Penggunaan

1. **Untuk Toko Retail:**
   - Gunakan unit "pcs" untuk produk satuan
   - Gunakan unit "box" untuk produk yang dibeli dalam karton/dus

2. **Setup Box Quantity:**
   - Pastikan box quantity diisi dengan benar saat tambah produk
   - Contoh: Air mineral kemasan = 24 pcs per box

3. **Manajemen Supplier:**
   - Tambahkan semua supplier yang aktif
   - Update kontak supplier secara berkala
   - Gunakan fitur "Lihat Detail" untuk analisis pembelian

4. **Best Practice:**
   - Link produk dengan supplier saat input
   - Selalu pilih satuan yang sesuai saat pembelian
   - Review riwayat pembelian supplier untuk negosiasi harga

---

## 📝 Catatan Teknis

- Semua konversi box ke pcs dilakukan di backend
- Stok selalu disimpan dalam pcs di database
- Unit hanya untuk kemudahan input
- API sudah mendukung field baru (backward compatible)

---

Dibuat: 6 Januari 2026
Versi: 1.0
