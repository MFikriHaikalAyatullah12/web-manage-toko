export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  min_stock?: number;
  supplier?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Transaction {
  id: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  date: Date; // This maps to created_at
  items?: TransactionItem[];
  created_at?: Date;
}

export interface TransactionItem {
  id?: number;
  transaction_id?: number;
  productId: number;  
  productName: string;
  quantity: number;
  price: number;
  cost?: number; // Cost of the item for profit calculation
  total: number;  // Calculated field: quantity * price
  created_at?: Date;
}

export interface Purchase {
  id: number;
  productId?: number;
  productName: string;
  quantity: number;
  price: number; // This maps to cost in DB
  total: number;
  supplier?: string;
  date: Date; // This maps to created_at
  created_at?: Date;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  todayTransactionCount: number;
  totalSales: number;
  totalPurchases: number;
  profit: number;
  recentTransactions: Array<{
    id: number;
    date: Date;
    total: number;
    paymentMethod: string;
  }>;
  topProducts?: Array<{
    name: string;
    sold: number;
  }>;
}

export interface ChartData {
  date: string;
  day: string;
  sales: number;
  purchases: number;
  profit: number;
  transactions: number;
}