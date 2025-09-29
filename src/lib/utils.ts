export const formatCurrency = (amount: number | null | undefined, short?: boolean) => {
  // Handle null, undefined, or NaN values
  const safeAmount = (amount === null || amount === undefined || isNaN(amount)) ? 0 : Number(amount);
  
  if (short && safeAmount >= 1000000) {
    // Format in millions for short format
    const millions = safeAmount / 1000000;
    return `Rp ${millions.toFixed(1)}M`;
  } else if (short && safeAmount >= 1000) {
    // Format in thousands for short format
    const thousands = safeAmount / 1000;
    return `Rp ${thousands.toFixed(0)}K`;
  }
  
  // Format dengan separator ribuan manual
  const formatted = Math.floor(safeAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
};

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '-';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '-';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatNumber = (num: number | null | undefined) => {
  const safeNum = (num === null || num === undefined || isNaN(num)) ? 0 : num;
  return new Intl.NumberFormat('id-ID').format(safeNum);
};

// Helper function to safely convert values to numbers
export const safeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? 0 : num;
};

export const calculateProfit = (price: number, cost: number, quantity: number) => {
  return (price - cost) * quantity;
};

export const calculateProfitMargin = (price: number, cost: number) => {
  return ((price - cost) / price) * 100;
};