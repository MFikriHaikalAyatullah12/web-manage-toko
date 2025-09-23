export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  date: Date;
  createdAt: Date;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  total: number;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  total: number;
  supplier: string;
  date: Date;
  createdAt: Date;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalLoss: number;
  lowStockItems: number;
  todaySales: number;
  todayProfit: number;
  monthlyGrowth: number;
}

export interface ChartData {
  date: string;
  sales: number;
  profit: number;
  transactions: number;
}