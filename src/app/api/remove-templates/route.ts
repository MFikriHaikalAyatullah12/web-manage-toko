import { NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/postgresql';

let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

export async function POST() {
  try {
    await ensureInitialized();
    
    console.log('🗑️  Menghapus semua data (transaksi, pembelian, dan produk)...');
    
    // Delete in order: transaction_items -> transactions, purchases -> products
    const transactionItems = await query('DELETE FROM transaction_items');
    console.log(`- Menghapus ${transactionItems.rowCount} item transaksi`);
    
    const transactions = await query('DELETE FROM transactions');
    console.log(`- Menghapus ${transactions.rowCount} transaksi`);
    
    const purchases = await query('DELETE FROM purchases');
    console.log(`- Menghapus ${purchases.rowCount} pembelian`);
    
    const products = await query('DELETE FROM products');
    console.log(`- Menghapus ${products.rowCount} produk`);
    
    console.log('✅ Semua data berhasil dihapus');
    
    return NextResponse.json({ 
      success: true, 
      message: `Berhasil menghapus semua data (${products.rowCount} produk, ${purchases.rowCount} pembelian, ${transactions.rowCount} transaksi). Database sekarang kosong dan siap untuk data Anda sendiri.`,
      deleted: {
        products: products.rowCount,
        purchases: purchases.rowCount,
        transactions: transactions.rowCount,
        transactionItems: transactionItems.rowCount
      }
    });
  } catch (error) {
    console.error('❌ Error menghapus data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
