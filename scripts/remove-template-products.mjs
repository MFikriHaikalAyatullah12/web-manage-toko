import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function removeTemplateProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Menghapus produk template...');
    
    // Menghapus semua produk yang ada (termasuk template)
    const result = await client.query('DELETE FROM products');
    
    console.log(`✅ Berhasil menghapus ${result.rowCount} produk template`);
    console.log('ℹ️  Database sekarang kosong dan siap untuk produk Anda sendiri');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

removeTemplateProducts();
