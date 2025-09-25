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
    
    // Get total products
    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count) || 0;
    
    // Get low stock products (stock <= min_stock)
    const lowStockResult = await query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE stock <= COALESCE(min_stock, 5)
    `);
    const lowStockProducts = parseInt(lowStockResult.rows[0].count) || 0;
    
    // Get today's sales
    const todaySalesResult = await query(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count 
      FROM transactions 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    const todaySales = parseFloat(todaySalesResult.rows[0].total) || 0;
    const todayTransactionCount = parseInt(todaySalesResult.rows[0].count) || 0;
    
    // Get total sales
    const totalSalesResult = await query('SELECT COALESCE(SUM(total), 0) as total FROM transactions');
    const totalSales = parseFloat(totalSalesResult.rows[0].total) || 0;
    
    // Get total purchases
    const totalPurchasesResult = await query('SELECT COALESCE(SUM(total), 0) as total FROM purchases');
    const totalPurchases = parseFloat(totalPurchasesResult.rows[0].total) || 0;
    
    // Get recent transactions (last 5)
    const recentTransactionsResult = await query(`
      SELECT 
        id, 
        created_at as date, 
        total, 
        payment_method as "paymentMethod"
      FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    // Get top selling products (by quantity sold)
    const topProductsResult = await query(`
      SELECT 
        ti.product_name as name,
        SUM(ti.quantity) as sold
      FROM transaction_items ti
      GROUP BY ti.product_name
      ORDER BY sold DESC
      LIMIT 5
    `);

    // Calculate actual profit from sold items (selling price - cost price)
    const profitResult = await query(`
      SELECT 
        COALESCE(SUM(ti.quantity * (ti.price - ti.cost)), 0) as total_profit
      FROM transaction_items ti
    `);
    const totalProfit = parseFloat(profitResult.rows[0].total_profit) || 0;

    const stats = {
      totalProducts,
      lowStockProducts,
      todaySales,
      todayTransactionCount,
      totalSales,
      totalPurchases,
      profit: totalProfit,
      recentTransactions: recentTransactionsResult.rows,
      topProducts: topProductsResult.rows.map(p => ({
        name: p.name,
        sold: parseInt(p.sold) || 0
      }))
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    );
  }
}