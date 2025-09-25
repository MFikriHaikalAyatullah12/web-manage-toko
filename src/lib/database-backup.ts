import pool from './db';
import { Product, Transaction, Purchase, DashboardStats, ChartData } from '@/types';

// Helper function for safe date conversion
const safeDate = (dateValue: string | number | Date | null | undefined): Date => {
  if (!dateValue) return new Date();
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Product functions
export const getProducts = async (): Promise<Product[]> => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, name, category, price, cost, stock, min_stock as "minStock", 
             supplier, created_at as "createdAt", updated_at as "updatedAt"
      FROM products 
      ORDER BY name
    `);
    client.release();
    
    return result.rows.map(row => ({
      ...row,
      id: row.id.toString(),
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, name, category, price, cost, stock, min_stock as "minStock", 
             supplier, created_at as "createdAt", updated_at as "updatedAt"
      FROM products 
      WHERE id = $1
    `, [id]);
    client.release();
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      id: row.id.toString(),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO products (name, category, price, cost, stock, min_stock, supplier)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, category, price, cost, stock, min_stock as "minStock", 
                supplier, created_at as "createdAt", updated_at as "updatedAt"
    `, [product.name, product.category, product.price, product.cost, product.stock, product.minStock, product.supplier]);
    client.release();
    
    const row = result.rows[0];
    return {
      ...row,
      id: row.id.toString(),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  try {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${valueIndex++}`);
      values.push(updates.name);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${valueIndex++}`);
      values.push(updates.category);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${valueIndex++}`);
      values.push(updates.price);
    }
    if (updates.cost !== undefined) {
      fields.push(`cost = $${valueIndex++}`);
      values.push(updates.cost);
    }
    if (updates.stock !== undefined) {
      fields.push(`stock = $${valueIndex++}`);
      values.push(updates.stock);
    }
    if (updates.minStock !== undefined) {
      fields.push(`min_stock = $${valueIndex++}`);
      values.push(updates.minStock);
    }
    if (updates.supplier !== undefined) {
      fields.push(`supplier = $${valueIndex++}`);
      values.push(updates.supplier);
    }

    if (fields.length === 0) return null;

    values.push(id);
    
    const client = await pool.connect();
    const result = await client.query(`
      UPDATE products 
      SET ${fields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING id, name, category, price, cost, stock, min_stock as "minStock", 
                supplier, created_at as "createdAt", updated_at as "updatedAt"
    `, values);
    client.release();
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      id: row.id.toString(),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const updateStock = async (productId: string, quantity: number): Promise<Product | null> => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      UPDATE products 
      SET stock = stock + $1
      WHERE id = $2
      RETURNING id, name, category, price, cost, stock, min_stock as "minStock", 
                supplier, created_at as "createdAt", updated_at as "updatedAt"
    `, [quantity, productId]);
    client.release();
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      id: row.id.toString(),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  } catch (error) {
    console.error('Error updating stock:', error);
    return null;
  }
};

// Transaction functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const client = await pool.connect();
    
    // Get transactions
    const transactionResult = await client.query(`
      SELECT id, subtotal, tax, discount, total, cashier_id as "cashierId", 
             cashier_name as "cashierName", payment_method as "paymentMethod",
             created_at as "createdAt"
      FROM transactions 
      ORDER BY created_at DESC
    `);
    
    // Get transaction items for each transaction
    const transactions: Transaction[] = [];
    
    for (const transactionRow of transactionResult.rows) {
      const itemsResult = await client.query(`
        SELECT product_id as "productId", product_name as "productName", 
               quantity, price, cost, total
        FROM transaction_items 
        WHERE transaction_id = $1
      `, [transactionRow.id]);
      
      transactions.push({
        ...transactionRow,
        id: transactionRow.id.toString(),
        items: itemsResult.rows,
        createdAt: new Date(transactionRow.createdAt)
      });
    }
    
    client.release();
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert transaction
    const transactionResult = await client.query(`
      INSERT INTO transactions (subtotal, tax, discount, total, cashier_id, cashier_name, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at as "createdAt"
    `, [
      transaction.subtotal, 
      transaction.tax, 
      transaction.discount, 
      transaction.total,
      transaction.cashierId,
      transaction.cashierName,
      transaction.paymentMethod
    ]);
    
    const transactionId = transactionResult.rows[0].id;
    const createdAt = transactionResult.rows[0].createdAt;
    
    // Insert transaction items and update stock
    for (const item of transaction.items) {
      // Insert transaction item
      await client.query(`
        INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, cost, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [transactionId, item.productId, item.productName, item.quantity, item.price, item.cost, item.total]);
      
      // Update product stock
      await client.query(`
        UPDATE products 
        SET stock = stock - $1
        WHERE id = $2
      `, [item.quantity, item.productId]);
    }
    
    await client.query('COMMIT');
    client.release();
    
    return {
      ...transaction,
      id: transactionId.toString(),
      createdAt: new Date(createdAt)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Error adding transaction:', error);
    return null;
  }
};

// Purchase functions
export const getPurchases = async (): Promise<Purchase[]> => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, product_id as "productId", product_name as "productName", 
             quantity, cost, total, supplier, created_at as "createdAt"
      FROM purchases 
      ORDER BY created_at DESC
    `);
    client.release();
    
    return result.rows.map(row => ({
      ...row,
      id: row.id.toString(),
      createdAt: new Date(row.createdAt)
    }));
  } catch (error) {
    console.error('Error getting purchases:', error);
    return [];
  }
};

export const addPurchase = async (purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<Purchase | null> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert purchase
    const purchaseResult = await client.query(`
      INSERT INTO purchases (product_id, product_name, quantity, cost, total, supplier)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at as "createdAt"
    `, [purchase.productId, purchase.productName, purchase.quantity, purchase.cost, purchase.total, purchase.supplier]);
    
    // Update product stock
    await client.query(`
      UPDATE products 
      SET stock = stock + $1
      WHERE id = $2
    `, [purchase.quantity, purchase.productId]);
    
    await client.query('COMMIT');
    client.release();
    
    const row = purchaseResult.rows[0];
    return {
      ...purchase,
      id: row.id.toString(),
      createdAt: new Date(row.createdAt)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Error adding purchase:', error);
    return null;
  }
};

// Analytics functions
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const client = await pool.connect();
    
    // Get total sales and costs
    const salesResult = await client.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(SUM(
          (SELECT SUM(ti.cost * ti.quantity) 
           FROM transaction_items ti 
           WHERE ti.transaction_id = t.id)
        ), 0) as total_costs
      FROM transactions t
    `);
    
    // Get today's sales
    const todayResult = await client.query(`
      SELECT 
        COALESCE(SUM(total), 0) as today_sales,
        COALESCE(SUM(
          (SELECT SUM(ti.cost * ti.quantity) 
           FROM transaction_items ti 
           WHERE ti.transaction_id = t.id)
        ), 0) as today_costs
      FROM transactions t
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Get low stock items count
    const lowStockResult = await client.query(`
      SELECT COUNT(*) as low_stock_count
      FROM products 
      WHERE stock <= min_stock
    `);
    
    client.release();
    
    const totalSales = parseFloat(salesResult.rows[0].total_sales);
    const totalCosts = parseFloat(salesResult.rows[0].total_costs);
    const todaySales = parseFloat(todayResult.rows[0].today_sales);
    const todayCosts = parseFloat(todayResult.rows[0].today_costs);
    const totalProfit = totalSales - totalCosts;
    const todayProfit = todaySales - todayCosts;
    
    return {
      totalSales,
      totalProfit,
      totalLoss: totalProfit < 0 ? Math.abs(totalProfit) : 0,
      lowStockItems: parseInt(lowStockResult.rows[0].low_stock_count),
      todaySales,
      todayProfit,
      monthlyGrowth: 12.5, // This would need more complex calculation
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalSales: 0,
      totalProfit: 0,
      totalLoss: 0,
      lowStockItems: 0,
      todaySales: 0,
      todayProfit: 0,
      monthlyGrowth: 0,
    };
  }
};

export const getChartData = async (days = 7): Promise<ChartData[]> => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ),
      daily_sales AS (
        SELECT 
          DATE(t.created_at) as date,
          COALESCE(SUM(t.total), 0) as sales,
          COALESCE(SUM(
            (SELECT SUM(ti.cost * ti.quantity) 
             FROM transaction_items ti 
             WHERE ti.transaction_id = t.id)
          ), 0) as costs,
          COUNT(t.id) as transactions
        FROM transactions t
        WHERE DATE(t.created_at) >= CURRENT_DATE - INTERVAL '${days - 1} days'
        GROUP BY DATE(t.created_at)
      )
      SELECT 
        ds.date,
        COALESCE(s.sales, 0) as sales,
        COALESCE(s.sales - s.costs, 0) as profit,
        COALESCE(s.transactions, 0) as transactions
      FROM date_series ds
      LEFT JOIN daily_sales s ON ds.date = s.date
      ORDER BY ds.date
    `);
    
    client.release();
    
    return result.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }),
      sales: parseFloat(row.sales),
      profit: parseFloat(row.profit),
      transactions: parseInt(row.transactions)
    }));
  } catch (error) {
    console.error('Error getting chart data:', error);
    return [];
  }
};