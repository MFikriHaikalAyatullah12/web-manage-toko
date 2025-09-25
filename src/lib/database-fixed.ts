import pool from './db';
import { Product, Transaction, Purchase, TransactionItem, DashboardStats, ChartData } from '@/types';

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
      createdAt: safeDate(row.createdAt),
      updatedAt: safeDate(row.updatedAt)
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
      createdAt: safeDate(row.createdAt),
      updatedAt: safeDate(row.updatedAt)
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
      createdAt: safeDate(row.createdAt),
      updatedAt: safeDate(row.updatedAt)
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> => {
  try {
    const client = await pool.connect();
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (product.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(product.name);
    }
    if (product.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(product.category);
    }
    if (product.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(product.price);
    }
    if (product.cost !== undefined) {
      fields.push(`cost = $${paramCount++}`);
      values.push(product.cost);
    }
    if (product.stock !== undefined) {
      fields.push(`stock = $${paramCount++}`);
      values.push(product.stock);
    }
    if (product.minStock !== undefined) {
      fields.push(`min_stock = $${paramCount++}`);
      values.push(product.minStock);
    }
    if (product.supplier !== undefined) {
      fields.push(`supplier = $${paramCount++}`);
      values.push(product.supplier);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);

    const result = await client.query(`
      UPDATE products 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, category, price, cost, stock, min_stock as "minStock", 
                supplier, created_at as "createdAt", updated_at as "updatedAt"
    `, values);
    client.release();

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      id: row.id.toString(),
      createdAt: safeDate(row.createdAt),
      updatedAt: safeDate(row.updatedAt)
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
    client.release();
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Transaction functions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT t.id, t.subtotal, t.tax, t.discount, t.total, 
             t.cashier_id as "cashierId", t.cashier_name as "cashierName",
             t.payment_method as "paymentMethod", t.created_at as "createdAt",
             json_agg(
               json_build_object(
                 'productId', ti.product_id,
                 'productName', ti.product_name,
                 'quantity', ti.quantity,
                 'price', ti.price,
                 'total', ti.total
               )
             ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id, t.subtotal, t.tax, t.discount, t.total, 
               t.cashier_id, t.cashier_name, t.payment_method, t.created_at
      ORDER BY t.created_at DESC
    `);
    client.release();

    return result.rows.map(row => ({
      ...row,
      id: row.id.toString(),
      date: safeDate(row.createdAt),
      createdAt: safeDate(row.createdAt),
      items: row.items || []
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction: {
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: string;
}): Promise<Transaction | null> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert transaction
    const transactionResult = await client.query(`
      INSERT INTO transactions (subtotal, tax, discount, total, cashier_id, cashier_name, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, subtotal, tax, discount, total, cashier_id as "cashierId", 
                cashier_name as "cashierName", payment_method as "paymentMethod", 
                created_at as "createdAt"
    `, [transaction.subtotal, transaction.tax, transaction.discount, transaction.total, 
        transaction.cashierId, transaction.cashierName, transaction.paymentMethod]);

    const transactionRow = transactionResult.rows[0];

    // Insert transaction items and update product stock
    for (const item of transaction.items) {
      // Insert transaction item
      await client.query(`
        INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, total)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [transactionRow.id, item.productId, item.productName, item.quantity, item.price, item.total]);

      // Update product stock
      await client.query(`
        UPDATE products 
        SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [item.quantity, item.productId]);
    }

    await client.query('COMMIT');

    return {
      ...transactionRow,
      id: transactionRow.id.toString(),
      date: safeDate(transactionRow.createdAt),
      createdAt: safeDate(transactionRow.createdAt),
      items: transaction.items
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding transaction:', error);
    return null;
  } finally {
    client.release();
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
      date: safeDate(row.createdAt),
      createdAt: safeDate(row.createdAt)
    }));
  } catch (error) {
    console.error('Error getting purchases:', error);
    return [];
  }
};

export const addPurchase = async (purchase: {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  total: number;
  supplier: string;
}): Promise<Purchase | null> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert purchase
    const purchaseResult = await client.query(`
      INSERT INTO purchases (product_id, product_name, quantity, cost, total, supplier)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, product_id as "productId", product_name as "productName", 
                quantity, cost, total, supplier, created_at as "createdAt"
    `, [purchase.productId, purchase.productName, purchase.quantity, 
        purchase.cost, purchase.total, purchase.supplier]);

    const purchaseRow = purchaseResult.rows[0];

    // Update product stock and cost
    await client.query(`
      UPDATE products 
      SET stock = stock + $1, cost = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
    `, [purchase.quantity, purchase.cost, purchase.productId]);

    await client.query('COMMIT');

    return {
      ...purchaseRow,
      id: purchaseRow.id.toString(),
      date: safeDate(purchaseRow.createdAt),
      createdAt: safeDate(purchaseRow.createdAt)
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding purchase:', error);
    return null;
  } finally {
    client.release();
  }
};

// Dashboard functions
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const client = await pool.connect();

    // Get total sales and costs
    const salesResult = await client.query(`
      SELECT
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(SUM(
          (SELECT SUM(ti.quantity * p.cost) 
           FROM transaction_items ti 
           JOIN products p ON ti.product_id = p.id 
           WHERE ti.transaction_id = t.id)
        ), 0) as total_costs,
        COUNT(*) as total_transactions
      FROM transactions t
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const salesData = salesResult.rows[0];
    const todaySales = parseFloat(salesData.total_sales) || 0;
    const todayCosts = parseFloat(salesData.total_costs) || 0;
    const todayProfit = todaySales - todayCosts;

    // Get products count and low stock count
    const productsResult = await client.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_count
      FROM products
    `);

    const productsData = productsResult.rows[0];

    // Get this month's data
    const monthlyResult = await client.query(`
      SELECT
        COALESCE(SUM(total), 0) as monthly_sales,
        COUNT(*) as monthly_transactions
      FROM transactions
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const monthlyData = monthlyResult.rows[0];

    client.release();

    return {
      totalSales: parseFloat(monthlyData.monthly_sales) || 0,
      totalProfit: todayProfit,
      totalLoss: 0,
      lowStockItems: parseInt(productsData.low_stock_count) || 0,
      todaySales,
      todayProfit,
      monthlyGrowth: 0
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
      monthlyGrowth: 0
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
          INTERVAL '1 day'
        )::date as date
      )
      SELECT 
        ds.date,
        COALESCE(SUM(t.total), 0) as sales,
        COUNT(t.id) as transactions
      FROM date_series ds
      LEFT JOIN transactions t ON DATE(t.created_at) = ds.date
      GROUP BY ds.date
      ORDER BY ds.date
    `);

    client.release();

    return result.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }),
      sales: parseFloat(row.sales) || 0,
      profit: parseFloat(row.sales) * 0.3 || 0, // Estimate 30% profit margin
      transactions: parseInt(row.transactions) || 0
    }));
  } catch (error) {
    console.error('Error getting chart data:', error);
    return [];
  }
};