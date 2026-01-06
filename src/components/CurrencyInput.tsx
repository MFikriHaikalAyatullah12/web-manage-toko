'use client';

import { useState, useEffect } from 'react';
import { formatRupiah, handleCurrencyInput } from '@/lib/currency-input';

interface CurrencyInputProps {
  value: number;
  onChange: (numericValue: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  required = false
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when prop value changes
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatRupiah(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    handleCurrencyInput(inputValue, (formattedValue, numericValue) => {
      setDisplayValue(formattedValue);
      onChange(numericValue);
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all on focus for easy replacement
    e.target.select();
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      aria-label="Currency input"
    />
  );
}
