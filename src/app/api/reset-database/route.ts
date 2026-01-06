import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Delete all data from tables (keep structure)
      await client.query('TRUNCATE TABLE transaction_items CASCADE');
      await client.query('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE purchases RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('✅ Database reset successfully');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database berhasil direset. Semua produk dan data telah dihapus.' 
      });
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal mereset database' 
    }, { status: 500 });
  }
}
