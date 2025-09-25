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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();
    const { id } = await params;
    
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );
    
    if (result.rows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Product deleted successfully' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();
    const { id } = await params;
    const body = await request.json();
    const { name, price, stock, category, cost, minStock, supplier } = body;

    const result = await query(`
      UPDATE products 
      SET name = $1, category = $2, price = $3, cost = $4, stock = $5, min_stock = $6, supplier = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, name, category, price, cost, stock, min_stock, supplier, created_at, updated_at
    `, [name, category || 'General', price, cost || 0, stock, minStock || 5, supplier || null, parseInt(id)]);

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    } else {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}