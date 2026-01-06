import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('Testing database connection to Neon.tech...\n');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  console.log('Attempting to connect...');
  const client = await pool.connect();
  console.log('✅ Successfully connected to database!\n');
  
  // Test query
  const result = await client.query('SELECT NOW() as current_time, version()');
  console.log('📅 Server time:', result.rows[0].current_time);
  console.log('🐘 PostgreSQL version:', result.rows[0].version.split(',')[0]);
  
  // Check if tables exist
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  
  console.log('\n📊 Existing tables:');
  if (tables.rows.length === 0) {
    console.log('   No tables found - database needs initialization');
  } else {
    tables.rows.forEach(row => {
      console.log('   -', row.table_name);
    });
  }
  
  client.release();
  await pool.end();
  
  console.log('\n✅ Connection test completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error connecting to database:');
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  await pool.end();
  process.exit(1);
}
