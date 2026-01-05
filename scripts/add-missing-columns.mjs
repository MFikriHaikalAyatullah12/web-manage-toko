import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
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

const { Pool } = pg;

const pool = new Pool({
  connectionString: envVars.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addMissingColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding missing columns to database...\n');
    
    // Add description column to products
    const checkDescription = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
        AND column_name = 'description';
    `);
    
    if (checkDescription.rows.length === 0) {
      console.log('➕ Adding description column to products table...');
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN description TEXT;
      `);
      console.log('✅ Description column added successfully\n');
    } else {
      console.log('ℹ️  Description column already exists\n');
    }
    
    // Add updated_at column to products if not exists
    const checkUpdatedAt = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
        AND column_name = 'updated_at';
    `);
    
    if (checkUpdatedAt.rows.length === 0) {
      console.log('➕ Adding updated_at column to products table...');
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ Updated_at column added successfully\n');
    } else {
      console.log('ℹ️  Updated_at column already exists\n');
    }
    
    console.log('✅ All missing columns have been added!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addMissingColumns().catch(console.error);
