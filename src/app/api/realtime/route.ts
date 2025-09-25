import { NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/postgresql';

// Initialize database on first request
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

async function getDashboardStats() {
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
      date, 
      total, 
      payment_method as "paymentMethod"
    FROM transactions 
    ORDER BY date DESC 
    LIMIT 5
  `);
  
  return {
    totalProducts,
    lowStockProducts,
    todaySales,
    todayTransactionCount,
    totalSales,
    totalPurchases,
    profit: totalSales - totalPurchases,
    recentTransactions: recentTransactionsResult.rows
  };
}

async function getChartData(days = 7) {
  await ensureInitialized();
  
  // Get sales data for the last N days
  const salesResult = await query(`
    SELECT 
      DATE(date) as date,
      COALESCE(SUM(total), 0) as sales,
      COUNT(*) as transactions
    FROM transactions
    WHERE date >= CURRENT_DATE - INTERVAL '${days - 1} days'
    GROUP BY DATE(date)
    ORDER BY DATE(date)
  `);
  
  // Get purchases data for the last N days
  const purchasesResult = await query(`
    SELECT 
      DATE(date) as date,
      COALESCE(SUM(total), 0) as purchases
    FROM purchases
    WHERE date >= CURRENT_DATE - INTERVAL '${days - 1} days'
    GROUP BY DATE(date)
    ORDER BY DATE(date)
  `);
  
  // Create a map for easy lookup
  const salesMap = new Map();
  const purchasesMap = new Map();
  
  salesResult.rows.forEach(row => {
    salesMap.set(row.date, {
      sales: parseFloat(row.sales) || 0,
      transactions: parseInt(row.transactions) || 0
    });
  });
  
  purchasesResult.rows.forEach(row => {
    purchasesMap.set(row.date, parseFloat(row.purchases) || 0);
  });
  
  // Generate data for the last N days
  const chartData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const salesData = salesMap.get(dateStr) || { sales: 0, transactions: 0 };
    const purchaseData = purchasesMap.get(dateStr) || 0;
    
    chartData.push({
      date: dateStr,
      day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      sales: salesData.sales,
      purchases: purchaseData,
      profit: salesData.sales - purchaseData,
      transactions: salesData.transactions
    });
  }
  
  return chartData;
}

export async function GET() {
  try {
    // Get latest stats and chart data
    const [stats, chartData] = await Promise.all([
      getDashboardStats(),
      getChartData(7)
    ]);

    return NextResponse.json({
      stats,
      chartData,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Error getting realtime data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get realtime data',
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
  }
}