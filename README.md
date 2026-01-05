# Manage Toko - Sistem Manajemen Toko Online

Sistem manajemen toko online yang lengkap dengan tracking real-time untuk stok, penjualan, dan laporan keuntungan. Dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## ✨ Fitur Utama

### 📊 Dashboard Real-time
- Statistik penjualan dan keuntungan secara real-time
- Grafik penjualan 7 hari terakhir
- Peringatan stok rendah
- Indikator performa bisnis
- Aksi cepat untuk navigasi

### 💰 Transaksi Penjualan
- Input penjualan dengan interface yang mudah digunakan
- Pencarian produk yang cepat
- Keranjang belanja dengan kalkulasi otomatis
- Multiple metode pembayaran (Tunai, Kartu, Transfer)
- Sistem diskon
- Update stok otomatis setelah transaksi

### 📦 Manajemen Stok & Inventori
- Daftar produk dengan status stok
- Tambah produk baru dengan kategori
- Input pembelian dari supplier
- Update stok otomatis
- Peringatan stok minimum
- Tracking supplier

### 📋 Laporan Komprehensif
- Laporan penjualan dengan filter tanggal
- Riwayat pembelian
- Ringkasan finansial (Total sales, HPP, Profit)
- Analisis margin keuntungan
- Export data dalam format yang mudah dibaca

### 📈 Analisis Bisnis
- Grafik penjualan dan keuntungan
- Produk terlaris
- Peringatan stok kritis
- Key Performance Indicators (KPI)
- Insight bisnis otomatis

### 📱 Responsive Design
- **Mobile-first design** optimal untuk Android dan iOS
- **Swipe gestures** untuk navigasi sidebar
- **Touch-optimized** dengan minimum 44x44px touch targets
- **PWA capable** dapat diinstall di home screen
- **Adaptive layout** menyesuaikan dari smartphone hingga desktop
- **Card & Table hybrid** view untuk berbagai ukuran layar
- **Theme color** untuk Android address bar
- Lihat [MOBILE_RESPONSIVE.md](./MOBILE_RESPONSIVE.md) untuk detail lengkap

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Instalasi
1. Clone repository ini atau download project
2. Buka terminal di folder project
3. Install dependencies:
   ```bash
   npm install
   ```

### Menjalankan Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`

### Build untuk Production
```bash
npm run build
npm start
```

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Custom SVG Icons
- **State Management**: React useState/useEffect
- **Data Storage**: In-memory database (dapat diganti dengan database real)

## 📁 Struktur Project

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── transactions/      # Halaman transaksi penjualan
│   ├── inventory/         # Halaman manajemen stok
│   ├── reports/           # Halaman laporan
│   ├── analytics/         # Halaman analisis
│   └── layout.tsx         # Layout utama
├── components/            # React components
│   └── Sidebar.tsx        # Komponen sidebar navigation
├── lib/                   # Utilities dan database
│   ├── database.ts        # Mock database dan functions
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    └── index.ts           # Interface dan types
```

## 💡 Cara Penggunaan

### 1. Dashboard
- Lihat statistik bisnis secara real-time
- Monitor produk dengan stok rendah
- Akses cepat ke fitur utama

### 2. Input Transaksi Penjualan
- Pilih produk dari daftar
- Tambahkan ke keranjang
- Atur jumlah dan diskon
- Proses transaksi
- Stok akan otomatis berkurang

### 3. Manajemen Stok
- **Tambah Produk**: Input produk baru dengan detail lengkap
- **Input Pembelian**: Catat pembelian dari supplier
- **Monitor Stok**: Lihat status stok semua produk

### 4. Laporan
- Filter berdasarkan tanggal
- Lihat riwayat penjualan dan pembelian
- Analisis profit dan margin

### 5. Analisis
- Pantau tren penjualan
- Identifikasi produk terlaris
- Monitor KPI bisnis

## 🎯 Target User

- **Admin Toko**: Pemilik toko yang ingin mengelola bisnis secara digital
- **Kasir**: Staff yang bertugas melayani transaksi penjualan
- **Manager**: Supervisor yang membutuhkan laporan dan analisis

## ⚡ Keunggulan Sistem

1. **Real-time Updates**: Semua data ter-update secara langsung
2. **User-friendly**: Interface yang mudah dipahami
3. **Mobile Responsive**: Optimal di Android/iOS dengan swipe gestures
4. **Comprehensive**: Mencakup semua aspek manajemen toko
5. **Fast Performance**: Dibangun dengan teknologi modern (Next.js 15 + Turbopack)
6. **Type-safe**: Menggunakan TypeScript untuk mengurangi bugs
7. **Modern UI**: Purple gradient theme dengan glass morphism effects
8. **Excel Export**: Laporan lengkap dengan multiple sheets

## 🔮 Pengembangan Selanjutnya

- [x] Responsive design untuk mobile (Android/iOS)
- [x] Export laporan ke Excel dengan multiple sheets
- [x] Modern UI redesign dengan gradient theme
- [x] Interactive line chart dengan trend indicators
- [ ] Offline mode dengan Service Worker (PWA)
- [ ] Authentication multi-user dengan role management
- [ ] Push notifications untuk stok rendah
- [ ] Barcode scanner integration
- [ ] Multi-store support
- [ ] Advanced analytics dengan AI insights
- [ ] Integrasi payment gateway
- [ ] Biometric login (Face ID/Fingerprint)

## 📱 Mobile Features

Website ini telah dioptimalkan untuk pengalaman mobile yang sempurna:

### iOS
- Add to Home Screen support
- Swipe gestures untuk navigasi
- Safe area untuk notched devices (iPhone X+)
- No input zoom (viewport optimized)

### Android
- Theme color untuk address bar
- Install banner prompt (PWA)
- Touch optimization (44x44px targets)
- Material design compliance

Baca dokumentasi lengkap di [MOBILE_RESPONSIVE.md](./MOBILE_RESPONSIVE.md)

## 📞 Support

Jika Anda memiliki pertanyaan atau membutuhkan bantuan, silakan buka issue di repository ini atau hubungi developer.

## 📄 License

MIT License - Anda bebas menggunakan, memodifikasi, dan mendistribusikan project ini.

---

**Happy Coding! 🚀**
