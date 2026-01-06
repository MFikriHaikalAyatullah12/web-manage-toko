import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase, getClient } from '@/lib/postgresql';

// Initialize database on first request
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureInitialized();
    
    const result = await query(`
      SELECT 
        id,
        product_id as "productId",
        product_name as "productName",
        quantity,
        unit,
        cost as price,
        total,
        supplier,
        supplier_id as "supplierId",
        created_at as date,
        created_at
      FROM purchases 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error getting purchases:', error);
    return NextResponse.json(
      { error: 'Failed to get purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient();
  
  try {
    await ensureInitialized();
    await client.query('BEGIN');
    
    const body = await request.json();
    const { productId, productName, quantity, unit, price, total, supplier, supplierId } = body;

    if (!productName || !quantity || !price || !total) {
      throw new Error('Missing required fields');
    }

    // Insert purchase
    const purchaseResult = await client.query(`
      INSERT INTO purchases (product_id, product_name, quantity, unit, cost, total, supplier, supplier_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id, product_id as "productId", product_name as "productName", quantity, unit, cost as price, total, supplier, supplier_id as "supplierId", created_at as date, created_at
    `, [productId || null, productName, quantity, unit || 'pcs', price, total, supplier || null, supplierId || null]);

    // Update product stock if product exists
    if (productId) {
      await client.query(`
        UPDATE products 
        SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [quantity, productId]);
    }

    await client.query('COMMIT');
    
    return NextResponse.json(purchaseResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding purchase:', error);
    return NextResponse.json(
      { error: 'Failed to add purchase' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}