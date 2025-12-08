import React, { useEffect, useRef, useState } from 'react';

type Props = {
  id?: string;
  value: string;
  onChange: (raw: string) => void;
  currency?: string; // 'UGX' => 0 decimals, others => 2 decimals
  allowNegative?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const decimalsForCurrency = (c?: string) => {
  if (!c) return 2;
  if (String(c).toUpperCase() === 'UGX') return 0;
  return 2;
};

const formatNumber = (raw: string, decimals: number) => {
  if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return raw;
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  // use Intl.NumberFormat to add thousand separators
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  };
  return new Intl.NumberFormat(undefined, opts).format(n);
};

export default function AmountInput({ id, value, onChange, currency, allowNegative = true, disabled = false, placeholder, className }: Props) {
  const decimals = decimalsForCurrency(currency);
  const [display, setDisplay] = useState<string>(value ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusedRef = useRef(false);

  // sync when external value changes while not focused
  useEffect(() => {
    if (!focusedRef.current) {
      setDisplay(value ?? '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // allow empty, minus, digits, decimal point
    const allowed = allowNegative ? /^-?\d*\.?\d*$/: /^\d*\.?\d*$/;
    if (v === '' || allowed.test(v)) {
      setDisplay(v);
      // propagate raw normalized value (remove leading zeros? keep as-is)
      // normalize to standard decimal string (no commas)
      const normalized = v.replace(/,/g, '');
      onChange(normalized);
    }
  };

  const handleFocus = () => {
    focusedRef.current = true;
    // show raw value (unformatted)
    setDisplay(value ?? '');
    // optional: select all for easier typing
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    focusedRef.current = false;
    // format for display
    const formatted = formatNumber(value ?? display, decimals);
    setDisplay(formatted);
  };

  return (
    <input
      id={id}
      ref={inputRef}
      className={className}
      disabled={disabled}
      inputMode="decimal"
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      type="text"
    />
  );
}