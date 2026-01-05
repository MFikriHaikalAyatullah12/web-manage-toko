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
    // Remove quotes if present
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

async function addCostColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Checking if cost column exists...');
    
    // Check if cost column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transaction_items' 
        AND column_name = 'cost';
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('➕ Adding cost column to transaction_items table...');
      await client.query(`
        ALTER TABLE transaction_items 
        ADD COLUMN cost DECIMAL(10,2) DEFAULT 0;
      `);
      console.log('✅ Cost column added successfully');
      
      // Update existing records with default cost (0 for now)
      await client.query(`
        UPDATE transaction_items 
        SET cost = 0 
        WHERE cost IS NULL;
      `);
      console.log('✅ Updated existing records with default cost');
    } else {
      console.log('ℹ️  Cost column already exists');
    }
    
    // Also add min_stock column to products if not exists
    const checkMinStock = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
        AND column_name = 'min_stock';
    `);
    
    if (checkMinStock.rows.length === 0) {
      console.log('➕ Adding min_stock column to products table...');
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN min_stock INTEGER DEFAULT 5;
      `);
      console.log('✅ Min_stock column added successfully');
    } else {
      console.log('ℹ️  Min_stock column already exists');
    }
    
    console.log('\n✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCostColumn().catch(console.error);
