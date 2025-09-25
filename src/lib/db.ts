import { Pool } from 'pg';

// Database connection pool with improved configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10000ms
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Retry function for database operations
export const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
};

// Test database connection with retry
export const testConnection = async () => {
  try {
    return await withRetry(async () => {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('Database connected successfully:', result.rows[0]);
      client.release();
      return true;
    });
  } catch (error) {
    console.error('Database connection failed after retries:', error);
    return false;
  }
};

export default pool;