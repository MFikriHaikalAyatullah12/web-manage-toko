import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/postgresql';

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
      SELECT id, name, price, stock, category, cost, min_stock, supplier, unit, box_quantity, supplier_id, created_at, updated_at
      FROM products 
      ORDER BY name ASC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { name, price, stock, category, cost, minStock, supplier, unit, boxQuantity, supplierId } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, stock' },
        { status: 400 }
      );
    }

    const result = await query(`
      INSERT INTO products (name, category, price, cost, stock, min_stock, supplier, unit, box_quantity, supplier_id, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING id, name, category, price, cost, stock, min_stock, supplier, unit, box_quantity, supplier_id, created_at, updated_at
    `, [
      name, 
      category || 'General', 
      price, 
      cost || 0, 
      stock, 
      minStock || 5, 
      supplier || null, 
      unit || 'pcs', 
      boxQuantity || 1, 
      supplierId || null
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    );
  }
}