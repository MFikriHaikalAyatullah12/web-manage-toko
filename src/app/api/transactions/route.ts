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
        t.id,
        t.created_at as date,
        t.total,
        t.subtotal,
        t.tax,
        t.discount,
        t.cashier_id as "cashierId",
        t.cashier_name as "cashierName",
        t.payment_method as "paymentMethod",
        t.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ti.id,
              'productId', ti.product_id,
              'productName', ti.product_name,
              'quantity', ti.quantity,
              'price', ti.price,
              'cost', ti.cost,
              'total', (ti.quantity * ti.price)
            ) ORDER BY ti.id
          ) FILTER (WHERE ti.id IS NOT NULL), 
          '[]'::json
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id, t.created_at, t.total, t.subtotal, t.tax, t.discount, t.cashier_id, t.cashier_name, t.payment_method, t.created_at
      ORDER BY t.created_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error getting transactions:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        error: 'Failed to get transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
    const { items, subtotal, tax, discount, total, cashierId, cashierName, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Transaction must have at least one item');
    }

    // Insert transaction
    const transactionResult = await client.query(`
      INSERT INTO transactions (subtotal, tax, discount, total, cashier_id, cashier_name, payment_method, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id, subtotal, tax, discount, total, cashier_id as "cashierId", cashier_name as "cashierName", payment_method as "paymentMethod", created_at
    `, [subtotal || 0, tax || 0, discount || 0, total, cashierId || 'system', cashierName || 'System', paymentMethod || 'cash']);

    const transaction = transactionResult.rows[0];
    const transactionId = transaction.id;

    // Validate stock availability for all items first
    for (const item of items) {
      if (item.productId) {
        const stockCheck = await client.query(`
          SELECT stock, name FROM products WHERE id = $1
        `, [item.productId]);
        
        if (stockCheck.rows.length === 0) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
        }
        
        const currentStock = stockCheck.rows[0].stock;
        const productName = stockCheck.rows[0].name;
        
        if (currentStock < item.quantity) {
          throw new Error(`Stok tidak mencukupi untuk produk "${productName}". Stok tersedia: ${currentStock}, diminta: ${item.quantity}`);
        }
      }
    }

    // Insert transaction items and update product stock
    for (const item of items) {
      // Insert transaction item
      await client.query(`
        INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, cost, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [transactionId, item.productId, item.productName || item.name, item.quantity, item.price, item.cost || 0, item.total || (item.quantity * item.price)]);

      // Update product stock (with additional safety check)
      if (item.productId) {
        await client.query(`
          UPDATE products 
          SET stock = GREATEST(0, stock - $1), updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND stock >= $1
        `, [item.quantity, item.productId]);
        
        // Double check that the update was successful
        const updatedStock = await client.query(`
          SELECT stock FROM products WHERE id = $1
        `, [item.productId]);
        
        if (updatedStock.rows[0].stock < 0) {
          throw new Error(`Gagal mengupdate stok untuk produk ID ${item.productId}`);
        }
      }
    }

    await client.query('COMMIT');
    
    // Return transaction with items
    const finalResult = await query(`
      SELECT 
        t.id,
        t.created_at as date,
        t.total,
        t.subtotal,
        t.tax,
        t.discount,
        t.cashier_id as "cashierId",
        t.cashier_name as "cashierName", 
        t.payment_method as "paymentMethod",
        t.created_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ti.id,
            'productId', ti.product_id,
            'productName', ti.product_name,
            'quantity', ti.quantity,
            'price', ti.price,
            'total', (ti.quantity * ti.price)
          ) ORDER BY ti.id
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.id = $1
      GROUP BY t.id, t.created_at, t.total, t.subtotal, t.tax, t.discount, t.cashier_id, t.cashier_name, t.payment_method, t.created_at
    `, [transactionId]);

    return NextResponse.json(finalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}