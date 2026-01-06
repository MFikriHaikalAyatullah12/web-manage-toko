# 🔧 Setup Database - Panduan Lengkap

## Masalah: Data Hilang Setelah Refresh

Jika data Anda (produk, transaksi) hilang setiap kali refresh atau keluar dari website, itu karena **database belum di-setup**.

## ✅ Solusi: Setup PostgreSQL Database

### Cara 1: Setup Melalui Web Interface (TERMUDAH) ⭐

1. **Pastikan development server berjalan:**
   ```bash
   npm run dev
   ```

2. **Buka browser dan akses:**
   ```
   http://localhost:3000/setup
   ```

3. **Klik tombol "Setup Database"**
   - Tunggu hingga muncul pesan sukses
   - Database akan otomatis dibuat dengan semua table yang diperlukan

4. **Selesai!** Sekarang semua data akan tersimpan permanen

### Cara 2: Setup Melalui Terminal

```bash
npm run db:setup
```

---

## 🗄️ Konfigurasi Database

Project ini menggunakan **PostgreSQL** untuk menyimpan data secara permanen.

### File Konfigurasi: `.env.local`

Database connection string sudah dikonfigurasi di file `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/manage_toko
```

### Jika PostgreSQL Belum Terinstall

**Untuk Dev Container (GitHub Codespaces):**
PostgreSQL sudah terinstall otomatis. Anda cukup jalankan setup.

**Untuk Development Lokal:**

1. **Install PostgreSQL:**
   - Windows: Download dari [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service:**
   - Windows: Otomatis start setelah install
   - Mac: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

3. **Buat database:**
   ```bash
   createdb manage_toko
   ```

---

## 📋 Apa yang Terjadi Saat Setup?

Setup database akan membuat table-table berikut:

1. **suppliers** - Data supplier/vendor
2. **products** - Daftar produk dengan harga dan stok
3. **purchases** - Riwayat pembelian dari supplier
4. **transactions** - Riwayat penjualan
5. **transaction_items** - Detail item di setiap transaksi

---

## ⚠️ Troubleshooting

### Error: "Failed to fetch dashboard stats"

**Penyebab:** Database belum di-setup atau connection error

**Solusi:**
1. Pastikan PostgreSQL berjalan
2. Jalankan setup database: `/setup` atau `npm run db:setup`
3. Check file `.env.local` untuk connection string yang benar

### Error: "Connection refused"

**Penyebab:** PostgreSQL service tidak berjalan

**Solusi:**
```bash
# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# PostgreSQL service akan start otomatis, cek di Services
```

### Data Masih Hilang Setelah Setup

**Penyebab:** Browser cache atau development server perlu restart

**Solusi:**
1. Stop development server (Ctrl+C)
2. Clear browser cache atau buka Incognito mode
3. Start server lagi: `npm run dev`
4. Buka `/setup` dan setup ulang

---

## 🔄 Reset Database (Hapus Semua Data)

Jika Anda ingin mulai fresh dan menghapus semua data:

**Melalui Web:**
```
http://localhost:3000/setup
```
Klik tombol **"Reset Database"**

**Melalui Terminal:**
```bash
npm run db:reset
```

⚠️ **PERINGATAN:** Ini akan menghapus SEMUA data!

---

## ✨ Setelah Setup Berhasil

Setelah database berhasil di-setup, Anda dapat:

1. ✅ Tambah produk di **Manajemen Stok**
2. ✅ Input transaksi penjualan di **Transaksi Penjualan**
3. ✅ Lihat laporan di **Laporan**
4. ✅ Analisa bisnis di **Analisis**

**Data akan tetap ada** walaupun:
- Refresh browser
- Keluar dan masuk lagi
- Restart server
- Restart komputer

---

## 📞 Butuh Bantuan?

Jika masih ada masalah, cek:
1. File log di terminal
2. Browser console (F12 > Console)
3. Pastikan port 5432 (PostgreSQL) tidak digunakan aplikasi lain

---

**Happy Managing! 🎉**
