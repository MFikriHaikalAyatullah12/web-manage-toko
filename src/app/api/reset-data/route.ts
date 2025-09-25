import { NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/postgresql';

export async function POST() {
  try {
    await initializeDatabase();
    
    // Delete all data from transactions and purchases tables
    await query('DELETE FROM transaction_items');
    await query('DELETE FROM transactions');
    await query('DELETE FROM purchases');
    
    // Reset the auto-increment sequences
    await query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE transaction_items_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE purchases_id_seq RESTART WITH 1');

    return NextResponse.json({ 
      success: true, 
      message: 'All transaction and purchase data has been reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}