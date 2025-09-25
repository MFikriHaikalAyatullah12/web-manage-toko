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

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    // Get period from query parameters, default to 7 days
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '7');
    const validPeriod = [7, 30].includes(period) ? period : 7;
    const daysBack = validPeriod - 1;
    
    // Get sales data for the specified period
    const salesResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as sales,
        COUNT(*) as transactions
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '${daysBack} days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);
    
    // Get purchases data for the specified period
    const purchasesResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as purchases
      FROM purchases
      WHERE created_at >= CURRENT_DATE - INTERVAL '${daysBack} days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);
    
    // Get profit data for the specified period (selling price - cost price)
    const profitResult = await query(`
      SELECT 
        DATE(t.created_at) as date,
        COALESCE(SUM(ti.quantity * (ti.price - ti.cost)), 0) as profit
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.created_at >= CURRENT_DATE - INTERVAL '${daysBack} days'
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at)
    `);

    // Create a map for easy lookup
    const salesMap = new Map();
    const purchasesMap = new Map();
    const profitMap = new Map();
    
    salesResult.rows.forEach(row => {
      // Convert PostgreSQL date to string format YYYY-MM-DD
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      salesMap.set(dateKey, {
        sales: parseFloat(row.sales) || 0,
        transactions: parseInt(row.transactions) || 0
      });
    });
    
    purchasesResult.rows.forEach(row => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      purchasesMap.set(dateKey, parseFloat(row.purchases) || 0);
    });

    profitResult.rows.forEach(row => {
      const dateKey = new Date(row.date).toISOString().split('T')[0];
      profitMap.set(dateKey, parseFloat(row.profit) || 0);
    });
    
    // Generate data for the specified period
    const chartData = [];
    const today = new Date();
    
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const salesData = salesMap.get(dateStr) || { sales: 0, transactions: 0 };
      const purchaseData = purchasesMap.get(dateStr) || 0;
      const profitData = profitMap.get(dateStr) || 0;
      
      chartData.push({
        date: date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: '2-digit'
        }), // Format: DD/MM
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        sales: salesData.sales,
        purchases: purchaseData,
        profit: profitData,
        transactions: salesData.transactions,
        dateStr: dateStr // Add for debugging
      });
    }
    
    console.log('Chart data generated:', chartData);
    console.log('Sales map:', Array.from(salesMap.entries()));
    
    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error getting chart data:', error);
    return NextResponse.json(
      { error: 'Failed to get chart data' },
      { status: 500 }
    );
  }
}