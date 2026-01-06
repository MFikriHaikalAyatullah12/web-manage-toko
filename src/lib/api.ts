
// Client-side API helpers
import { Product, Transaction, Purchase, DashboardStats, ChartData, TransactionItem } from '@/types';

const API_BASE_URL = '/api';

// Dashboard API
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Dashboard API error:', response.status);
      throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Realtime API
export const fetchRealtimeData = async (): Promise<{
  stats: DashboardStats;
  chartData: ChartData[];
  timestamp: string;
  success: boolean;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/realtime`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Realtime API error:', response.status);
      throw new Error(`Failed to fetch realtime data: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    throw error;
  }
};

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Products API error:', response.status, errorData);
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of throwing to prevent dashboard from breaking
    return [];
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/chart?period=${period}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Chart API error:', response.status);
      throw new Error(`Failed to fetch chart data: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching chart data:', error);
    // Return empty array to prevent dashboard from breaking
    return [];
  }
};