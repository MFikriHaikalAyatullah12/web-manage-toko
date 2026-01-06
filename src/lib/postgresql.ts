import { Pool } from 'pg';

// Create PostgreSQL connection pool for Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Check if tables already exist
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      );
    `);
    
    // If tables already exist, skip initialization
    if (checkResult.rows[0].exists) {
      console.log('✅ Database tables already exist, skipping initialization');
      return;
    }

    console.log('🔄 Initializing database tables...');

    // Create suppliers table
    await client.query(`
      CREATE TABLE suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'pcs',
        box_quantity INTEGER DEFAULT 1,
        supplier_id INTEGER REFERENCES suppliers(id),
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        cashier_id VARCHAR(50) NOT NULL,
        cashier_name VARCHAR(255) NOT NULL,
        payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transaction_items table for transaction details
    await client.query(`
      CREATE TABLE transaction_items (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create purchases table
    await client.query(`
      CREATE TABLE purchases (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(20) DEFAULT 'pcs',
        cost DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        supplier_id INTEGER REFERENCES suppliers(id),
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX idx_suppliers_name ON suppliers(name);
      CREATE INDEX idx_products_name ON products(name);
      CREATE INDEX idx_products_category ON products(category);
      CREATE INDEX idx_products_supplier_id ON products(supplier_id);
      CREATE INDEX idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
      CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);
      CREATE INDEX idx_purchases_created_at ON purchases(created_at);
      CREATE INDEX idx_purchases_product_id ON purchases(product_id);
      CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
    `);

    // Create function to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await client.query(`
      CREATE TRIGGER update_products_updated_at 
        BEFORE UPDATE ON products 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      CREATE TRIGGER update_suppliers_updated_at 
        BEFORE UPDATE ON suppliers 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // No sample data - users will add their own products

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Database query functions
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getClient() {
  return await pool.connect();
}

// Graceful shutdown - only end pool once on process exit
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default pool;