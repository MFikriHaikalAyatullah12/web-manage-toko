import pool, { withRetry } from './db';
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
    `, [product.name, product.category, product.price, product.cost, product.stock, product.min_stock, product.supplier]);
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
    if (product.min_stock !== undefined) {
      fields.push(`min_stock = $${paramCount++}`);
      values.push(product.min_stock);
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
                 'cost', COALESCE(ti.cost, 0),
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
      // Get product cost first
      const productResult = await client.query(`
        SELECT cost FROM products WHERE id = $1
      `, [item.productId]);
      
      const productCost = productResult.rows[0]?.cost || 0;
      
      // Insert transaction item with cost
      await client.query(`
        INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price, cost, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [transactionRow.id, item.productId, item.productName, item.quantity, item.price, productCost, item.total]);

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
    return await withRetry(async () => {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT id, product_id as "productId", product_name as "productName", 
                 quantity, cost, total, supplier, created_at as "createdAt"
          FROM purchases 
          ORDER BY created_at DESC
        `);
        
        return result.rows.map(row => ({
          ...row,
          id: row.id.toString(),
          date: safeDate(row.createdAt),
          createdAt: safeDate(row.createdAt)
        }));
      } finally {
        client.release();
      }
    });
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
    return await withRetry(async () => {
      const client = await pool.connect();
      try {
        // Get all transactions for accurate calculations
        const allSalesResult = await client.query(`
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
        `);

        // Get today's sales separately for realtime data
        const todaySalesResult = await client.query(`
          SELECT
            COALESCE(SUM(total), 0) as today_sales,
            COALESCE(SUM(
              (SELECT SUM(ti.quantity * p.cost) 
               FROM transaction_items ti 
               JOIN products p ON ti.product_id = p.id 
               WHERE ti.transaction_id = t.id)
            ), 0) as today_costs,
            COUNT(*) as today_transactions
          FROM transactions t
          WHERE DATE(created_at) = CURRENT_DATE
        `);

        // Get products count and low stock count
        const productsResult = await client.query(`
          SELECT 
            COUNT(*) as total_products,
            COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_count
          FROM products
        `);

        const allSalesData = allSalesResult.rows[0];
        const todayData = todaySalesResult.rows[0];
        const productsData = productsResult.rows[0];

        // Calculate values safely
        const totalSales = allSalesData.total_sales ? parseFloat(allSalesData.total_sales) : 0;
        const totalCosts = allSalesData.total_costs ? parseFloat(allSalesData.total_costs) : 0;
        const todaySales = todayData.today_sales ? parseFloat(todayData.today_sales) : 0;

        const safeTotalSales = isNaN(totalSales) ? 0 : totalSales;
        const safeTotalCosts = isNaN(totalCosts) ? 0 : totalCosts;
        const safeTodaySales = isNaN(todaySales) ? 0 : todaySales;

        const totalProfit = safeTotalSales - safeTotalCosts;
        const safeLowStock = productsData.low_stock_count ? parseInt(productsData.low_stock_count) : 0;

        return {
          totalProducts: productsData.total_products ? parseInt(productsData.total_products) : 0,
          lowStockProducts: isNaN(safeLowStock) ? 0 : safeLowStock,
          todaySales: safeTodaySales,
          todayTransactionCount: todayData.today_transactions ? parseInt(todayData.today_transactions) : 0,
          totalSales: safeTotalSales,
          totalPurchases: 0, // This could be calculated from purchases table if needed
          profit: isNaN(totalProfit) ? 0 : totalProfit,
          recentTransactions: []
        };
      } finally {
        client.release();
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalProducts: 0,
      lowStockProducts: 0,
      todaySales: 0,
      todayTransactionCount: 0,
      totalSales: 0,
      totalPurchases: 0,
      profit: 0,
      recentTransactions: []
    };
  }
};

export const getChartData = async (days = 7): Promise<ChartData[]> => {
  try {
    return await withRetry(async () => {
      const client = await pool.connect();
      try {
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
            COALESCE(SUM(
              (SELECT SUM(ti.quantity * p.cost) 
               FROM transaction_items ti 
               JOIN products p ON ti.product_id = p.id 
               WHERE ti.transaction_id = t.id)
            ), 0) as costs,
            COUNT(t.id) as transactions
          FROM date_series ds
          LEFT JOIN transactions t ON DATE(t.created_at) = ds.date
          GROUP BY ds.date
          ORDER BY ds.date
        `);

        return result.rows.map(row => {
          const sales = row.sales ? parseFloat(row.sales) : 0;
          const costs = row.costs ? parseFloat(row.costs) : 0;
          const safeSales = isNaN(sales) ? 0 : sales;
          const safeCosts = isNaN(costs) ? 0 : costs;
          const profit = safeSales - safeCosts; // Real profit calculation
          const transactions = row.transactions ? parseInt(row.transactions) : 0;
          
          return {
            date: new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }),
            day: new Date(row.date).toLocaleDateString('id-ID', { weekday: 'short' }),
            sales: safeSales,
            purchases: 0, // This could be calculated from purchases table if needed
            profit: isNaN(profit) ? 0 : profit,
            transactions: isNaN(transactions) ? 0 : transactions
          };
        });
      } finally {
        client.release();
      }
    });
  } catch (error) {
    console.error('Error getting chart data:', error);
    return [];
  }
};