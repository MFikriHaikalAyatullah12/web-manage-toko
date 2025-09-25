import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_EteTk4BWpcH2@ep-cool-fog-a1k5r0gm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking current database schema...');
    
    // Check tables
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:', tablesResult.rows.map(r => r.table_name));
    
    // Check products table structure
    const productsColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Products table columns:');
    productsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check transactions table structure
    const transactionsColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Transactions table columns:');
    transactionsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check purchases table structure
    const purchasesColumns = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'purchases' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Purchases table columns:');
    purchasesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseSchema();