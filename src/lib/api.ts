
// Client-side API helpers
import { Product, Transaction, Purchase, DashboardStats, ChartData, TransactionItem } from '@/types';

const API_BASE_URL = '/api';

// Dashboard API
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
};

// Realtime API
export const fetchRealtimeData = async (): Promise<{
  stats: DashboardStats;
  chartData: ChartData[];
  timestamp: string;
  success: boolean;
}> => {
  const response = await fetch(`${API_BASE_URL}/realtime`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch realtime data');
  }
  return response.json();
};

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
  const result = await response.json();
  return result.success;
};

// Transactions API
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

export const createTransaction = async (transaction: {
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cashierId: string;
  cashierName: string;
  paymentMethod: string;
}): Promise<Transaction> => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }
  return response.json();
};

// Purchases API
export const fetchPurchases = async (): Promise<Purchase[]> => {
  const response = await fetch(`${API_BASE_URL}/purchases`);
  if (!response.ok) {
    throw new Error('Failed to fetch purchases');
  }
  return response.json();
};

export const createPurchase = async (purchase: {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Changed from cost to price to match API
  total: number;
  supplier: string;
}): Promise<Purchase> => {
  const response = await fetch(`${API_BASE_URL}/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(purchase),
  });
  if (!response.ok) {
    throw new Error('Failed to create purchase');
  }
  return response.json();
};

// Chart data API
export const fetchChartData = async (period: number = 7): Promise<ChartData[]> => {
  const response = await fetch(`${API_BASE_URL}/chart?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  return response.json();
};