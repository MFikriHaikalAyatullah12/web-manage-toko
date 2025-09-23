export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
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

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const calculateProfit = (price: number, cost: number, quantity: number) => {
  return (price - cost) * quantity;
};

export const calculateProfitMargin = (price: number, cost: number) => {
  return ((price - cost) / price) * 100;
};