import pg from 'pg';
const { Pool } = pg;
import { readFileSync } from 'fs';

const envContent = readFileSync('/workspaces/web-manage-toko/.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const pool = new Pool({
  connectionString: envVars.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Testing purchases query...');
    const purchases = await pool.query(`
      SELECT 
        pu.created_at::date as tanggal,
        pu.product_name as nama_produk
      FROM purchases pu
      LIMIT 1
    `);
    console.log('✓ Purchases OK:', purchases.rows.length, 'rows');

    console.log('Testing transactions query...');
    const transactions = await pool.query(`
      SELECT 
        t.created_at::date as tanggal,
        ti.product_name as nama_produk
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      LIMIT 1
    `);
    console.log('✓ Transactions OK:', transactions.rows.length, 'rows');

    console.log('Testing summary query...');
    const summary = await pool.query(`
      SELECT 
        DATE(t.created_at) as tanggal,
        COUNT(DISTINCT t.id) as jumlah_transaksi
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY DATE(t.created_at)
      LIMIT 1
    `);
    console.log('✓ Summary OK:', summary.rows.length, 'rows');

    console.log('Testing daily sales query...');
    const dailySales = await pool.query(`
      SELECT 
        DATE(created_at) as tanggal,
        COUNT(*) as jumlah_transaksi
      FROM transactions
      GROUP BY DATE(created_at)
      LIMIT 1
    `);
    console.log('✓ Daily sales OK:', dailySales.rows.length, 'rows');

    console.log('Testing low stock query...');
    const lowStock = await pool.query(`
      SELECT 
        name as nama_produk,
        stock as stok_saat_ini
      FROM products
      WHERE stock <= min_stock
      LIMIT 1
    `);
    console.log('✓ Low stock OK:', lowStock.rows.length, 'rows');

    console.log('\nAll queries passed!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Detail:', error.detail);
    console.error('Hint:', error.hint);
  } finally {
    await pool.end();
  }
}

test();
