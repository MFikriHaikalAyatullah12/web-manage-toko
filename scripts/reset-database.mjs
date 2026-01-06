import pool from '../src/lib/db.js';

async function resetDatabase() {
  console.log('🔄 Memulai reset database...');
  
  try {
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      console.log('📋 Menghapus data dari transaction_items...');
      await client.query('TRUNCATE TABLE transaction_items CASCADE');
      
      console.log('📋 Menghapus data dari transactions...');
      await client.query('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE');
      
      console.log('📋 Menghapus data dari purchases...');
      await client.query('TRUNCATE TABLE purchases RESTART IDENTITY CASCADE');
      
      console.log('📋 Menghapus data dari products...');
      await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('✅ Database berhasil direset!');
      console.log('✅ Semua produk dan data telah dihapus.');
      
      // Verify
      const productCount = await client.query('SELECT COUNT(*) FROM products');
      const transactionCount = await client.query('SELECT COUNT(*) FROM transactions');
      const purchaseCount = await client.query('SELECT COUNT(*) FROM purchases');
      
      console.log('\n📊 Verifikasi:');
      console.log(`   - Produk: ${productCount.rows[0].count}`);
      console.log(`   - Transaksi: ${transactionCount.rows[0].count}`);
      console.log(`   - Pembelian: ${purchaseCount.rows[0].count}`);
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error reset database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the reset
resetDatabase();
