/**
 * Format number to rupiah string with thousand separators
 * Example: 1000000 => "1.000.000"
 */
export function formatRupiah(value: number | string): string {
  if (value === '' || value === null || value === undefined) return '';
  
  // Convert to number and remove any non-digit characters
  const numberValue = typeof value === 'string' 
    ? parseInt(value.replace(/\D/g, '')) || 0
    : value;
  
  // Format with thousand separators
  return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse rupiah string to number
 * Example: "1.000.000" => 1000000
 */
export function parseRupiah(value: string): number {
  if (!value) return 0;
  // Remove all dots and parse to integer
  return parseInt(value.replace(/\./g, '')) || 0;
}

/**
 * Handle input change for currency fields
 * Removes leading zeros and formats with thousand separators
 */
export function handleCurrencyInput(
  value: string,
  onChange: (formattedValue: string, numericValue: number) => void
) {
  // Remove all non-digit characters
  let cleanValue = value.replace(/\D/g, '');
  
  // Remove leading zeros
  cleanValue = cleanValue.replace(/^0+/, '') || '0';
  
  // Convert to number
  const numericValue = parseInt(cleanValue) || 0;
  
  // Format with thousand separators
  const formattedValue = formatRupiah(numericValue);
  
  // Call onChange with both formatted string and numeric value
  onChange(formattedValue, numericValue);
}

/**
 * Currency Input Props type
 */
export interface CurrencyInputProps {
  value: number | string;
  onChange: (numericValue: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
}
