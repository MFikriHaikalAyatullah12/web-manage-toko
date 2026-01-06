# Cara Menghapus Produk Template Secara Permanen

## Masalah
Produk template masih muncul setelah dihapus karena database menggunakan `CREATE TABLE IF NOT EXISTS` yang tidak menghapus data lama saat setup ulang.

## Solusi yang Telah Diterapkan

### 1. Update File `postgresql.ts`
File `/workspaces/web-manage-toko/src/lib/postgresql.ts` telah diperbarui untuk:
- Menghapus semua tabel lama saat setup ulang (`DROP TABLE IF EXISTS`)
- Membuat ulang tabel dengan struktur yang benar
- Menambahkan indexes dan triggers
- **TIDAK** menambahkan data template

### 2. API Endpoint Baru: Reset Database
Dibuat endpoint baru `/api/reset-database` yang:
- Menghapus SEMUA data dari database
- Menggunakan TRUNCATE untuk penghapusan cepat
- Mereset auto-increment ID
- Menjaga struktur tabel tetap utuh

### 3. Update Halaman Setup
Halaman `/setup` sekarang memiliki 2 tombol:
- **Setup Database**: Membuat ulang struktur database (menghapus semua tabel lama)
- **Reset Database**: Menghapus semua data tanpa mengubah struktur

## Cara Menghapus Produk Template

### Metode 1: Reset Database (Direkomendasikan)
1. Buka halaman `/setup` di browser
2. Klik tombol **"Reset Database (Hapus Semua Data)"**
3. Konfirmasi peringatan
4. Semua produk akan terhapus permanen
5. Halaman akan redirect ke dashboard secara otomatis

### Metode 2: Setup Ulang Database
1. Buka halaman `/setup` di browser
2. Klik tombol **"Setup Database"**
3. Ini akan menghapus dan membuat ulang semua tabel
4. Semua data lama (termasuk produk template) akan hilang

### Metode 3: Manual via Terminal
```bash
# Masuk ke direktori project
cd /workspaces/web-manage-toko

# Jalankan script reset
node scripts/init-db.mjs
```

## Perbedaan Kedua Metode

| Fitur | Reset Database | Setup Database |
|-------|---------------|----------------|
| Hapus data | ✅ Ya | ✅ Ya |
| Hapus tabel | ❌ Tidak | ✅ Ya |
| Buat ulang struktur | ❌ Tidak | ✅ Ya |
| Kecepatan | ⚡ Sangat cepat | 🐢 Lebih lambat |
| Kapan digunakan | Hapus data saja | Setup pertama kali atau fix struktur |

## Verifikasi Penghapusan

Setelah reset/setup, verifikasi bahwa produk benar-benar hilang:

1. **Refresh browser** (Ctrl+Shift+R atau Cmd+Shift+R untuk hard refresh)
2. Buka halaman **Manajemen Stok** (`/inventory`)
3. Pastikan tidak ada produk yang muncul
4. Cek counter di halaman utama - harus menunjukkan "0 produk tersedia"

## Mencegah Produk Template Muncul Lagi

File-file berikut telah dipastikan TIDAK menambahkan data template:

✅ `/src/lib/postgresql.ts` - Tidak ada INSERT statement
✅ `/src/lib/schema.sql` - Tidak ada data sample
✅ `/src/lib/setup.ts` - Tidak ada data template
✅ `/src/app/api/setup/route.ts` - Hanya memanggil initializeDatabase

## Catatan Penting

⚠️ **PERINGATAN**: 
- Reset Database akan menghapus SEMUA data termasuk:
  - Semua produk
  - Semua transaksi
  - Semua riwayat pembelian
  - Semua data analytics

- Pastikan backup data penting sebelum reset
- Tidak ada cara untuk undo setelah reset

## Troubleshooting

### Produk masih muncul setelah reset?

1. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

2. **Hard refresh halaman**:
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R

3. **Cek di Incognito/Private mode**:
   - Buka browser dalam mode private
   - Akses website untuk memastikan bukan masalah cache

4. **Restart development server**:
   ```bash
   # Stop server (Ctrl+C)
   # Start ulang
   npm run dev
   ```

5. **Verifikasi database langsung**:
   - Buka Neon Dashboard
   - Jalankan query: `SELECT COUNT(*) FROM products;`
   - Hasilnya harus 0 setelah reset

## Update Terakhir
- Tanggal: 6 Januari 2026
- Status: ✅ Masalah terperbaiki
- File yang diubah:
  - `src/lib/postgresql.ts`
  - `src/app/setup/page.tsx`
  - `src/app/api/reset-database/route.ts` (baru)
