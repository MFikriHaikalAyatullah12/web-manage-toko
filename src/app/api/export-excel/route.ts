import { NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/postgresql';
import * as XLSX from 'xlsx';

// Initialize database on first request
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureInitialized();
    
    console.log('Starting Excel export...');

    // 1. Get Barang Masuk (Purchases)
    console.log('Fetching purchases...');
    const purchases = await query(`
      SELECT 
        pu.created_at::date as tanggal,
        pu.product_name as nama_produk,
        prod.category as kategori,
        pu.quantity as jumlah,
        pu.cost as harga_satuan,
        pu.total as total_harga,
        pu.supplier as supplier
      FROM purchases pu
      LEFT JOIN products prod ON pu.product_id = prod.id
      ORDER BY pu.created_at DESC
    `);
    console.log('Purchases fetched:', purchases.rows.length, 'rows');

    // 2. Get Penjualan (Transactions)
    console.log('Fetching transactions...');
    const transactions = await query(`
      SELECT 
        t.created_at::date as tanggal,
        ti.product_name as nama_produk,
        prod.category as kategori,
        ti.quantity as jumlah,
        ti.price as harga_satuan,
        ti.total as total_harga,
        t.payment_method as metode_pembayaran
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products prod ON ti.product_id = prod.id
      ORDER BY t.created_at DESC
    `);
    console.log('Transactions fetched:', transactions.rows.length, 'rows');

    // 3. Get Total Penjualan & Keuntungan
    console.log('Fetching summary...');
    const summary = await query(`
      SELECT 
        DATE(t.created_at) as tanggal,
        COUNT(DISTINCT t.id) as jumlah_transaksi,
        SUM(ti.quantity) as total_item_terjual,
        SUM(ti.total) as total_penjualan,
        SUM(ti.quantity * COALESCE(ti.cost, 0)) as total_modal,
        SUM(ti.total - (ti.quantity * COALESCE(ti.cost, 0))) as keuntungan_bersih
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at) DESC
    `);
    console.log('Summary fetched:', summary.rows.length, 'rows');

    // 4. Get Penjualan Harian Detail
    console.log('Fetching daily sales...');
    const dailySales = await query(`
      SELECT 
        DATE(created_at) as tanggal,
        TO_CHAR(created_at, 'Day') as hari,
        COUNT(*) as jumlah_transaksi,
        SUM(total) as total_penjualan
      FROM transactions
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Day')
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `);
    console.log('Daily sales fetched:', dailySales.rows.length, 'rows');

    // 5. Get Stok Menipis
    console.log('Fetching low stock...');
    const lowStock = await query(`
      SELECT 
        name as nama_produk,
        category as kategori,
        stock as stok_saat_ini,
        min_stock as stok_minimum,
        price as harga_jual,
        cost as harga_modal,
        supplier as supplier,
        (min_stock - stock) as kekurangan
      FROM products
      WHERE stock <= min_stock AND stock >= 0
      ORDER BY (min_stock - stock) DESC, stock ASC
    `);
    console.log('Low stock fetched:', lowStock.rows.length, 'rows');

    console.log('Creating workbook...');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Format currency helper
    const formatCurrency = (value: any) => {
      const num = parseFloat(value || 0);
      return num.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
    };

    // Sheet 1: Barang Masuk
    const purchasesData = purchases.rows.map(row => ({
      'Tanggal': row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID') : '-',
      'Nama Produk': row.nama_produk || '-',
      'Kategori': row.kategori || '-',
      'Jumlah': row.jumlah || 0,
      'Harga Satuan': formatCurrency(row.harga_satuan),
      'Total Harga': formatCurrency(row.total_harga),
      'Supplier': row.supplier || '-'
    }));
    const ws1 = XLSX.utils.json_to_sheet(purchasesData);
    ws1['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, 
      { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws1, 'Barang Masuk');

    // Sheet 2: Penjualan
    const salesData = transactions.rows.map(row => ({
      'Tanggal': row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID') : '-',
      'Nama Produk': row.nama_produk || '-',
      'Kategori': row.kategori || '-',
      'Jumlah': row.jumlah || 0,
      'Harga Satuan': formatCurrency(row.harga_satuan),
      'Total Harga': formatCurrency(row.total_harga),
      'Metode Pembayaran': row.metode_pembayaran || '-'
    }));
    const ws2 = XLSX.utils.json_to_sheet(salesData);
    ws2['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, 
      { wch: 15 }, { wch: 15 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws2, 'Penjualan');

    // Sheet 3: Ringkasan Keuntungan
    const summaryData = summary.rows.map(row => ({
      'Tanggal': row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID') : '-',
      'Jumlah Transaksi': row.jumlah_transaksi || 0,
      'Total Item Terjual': row.total_item_terjual || 0,
      'Total Penjualan': formatCurrency(row.total_penjualan),
      'Total Modal': formatCurrency(row.total_modal),
      'Keuntungan Bersih': formatCurrency(row.keuntungan_bersih),
      'Margin (%)': row.total_penjualan > 0 
        ? ((parseFloat(row.keuntungan_bersih) / parseFloat(row.total_penjualan)) * 100).toFixed(2) + '%'
        : '0%'
    }));
    const ws3 = XLSX.utils.json_to_sheet(summaryData);
    ws3['!cols'] = [
      { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, 
      { wch: 18 }, { wch: 18 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws3, 'Keuntungan');

    // Sheet 4: Penjualan Harian
    const dailyData = dailySales.rows.map(row => ({
      'Tanggal': row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID') : '-',
      'Hari': row.hari ? row.hari.trim() : '-',
      'Jumlah Transaksi': row.jumlah_transaksi || 0,
      'Total Penjualan': formatCurrency(row.total_penjualan)
    }));
    const ws4 = XLSX.utils.json_to_sheet(dailyData);
    ws4['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, ws4, 'Penjualan Harian');

    // Sheet 5: Stok Menipis
    const lowStockData = lowStock.rows.map(row => ({
      'Nama Produk': row.nama_produk || '-',
      'Kategori': row.kategori || '-',
      'Stok Saat Ini': row.stok_saat_ini || 0,
      'Stok Minimum': row.stok_minimum || 0,
      'Kekurangan': row.kekurangan || 0,
      'Harga Jual': formatCurrency(row.harga_jual),
      'Harga Modal': formatCurrency(row.harga_modal),
      'Supplier': row.supplier || '-'
    }));
    const ws5 = XLSX.utils.json_to_sheet(lowStockData);
    ws5['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws5, 'Stok Menipis');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Laporan_Toko_${timestamp}.xlsx`;

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
