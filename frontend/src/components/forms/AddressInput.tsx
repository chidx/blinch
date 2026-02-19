/**
 * Bitcoin Cash address input with validation
 */

'use client';

import { forwardRef, useState, useEffect } from 'react';

interface AddressInputProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  defaultValue?: string;
  onChange?: (address: string, isValid: boolean) => void;
  className?: string;
}

// Basic BCH address validation
function validateBchAddress(address: string): boolean {
  if (!address) return false;

  // Remove prefix if present
  const cleanAddress = address.replace(/^bitcoincash:/, '');

  // Legacy address (34 chars) or new address (42 chars)
  const legacyPattern = /^[1-9A-HJ-NP-Za-km-z]{34}$/;
  const newPattern = /^[1-9A-HJ-NP-Za-km-z]{42}$/;

  return legacyPattern.test(cleanAddress) || newPattern.test(cleanAddress);
}

export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      label,
      name,
      placeholder = 'bitcoincash:qrqglczyxh4yvdnkkenk3k9ltq3e2j2dnqjvulv4rk',
      required = false,
      error: externalError,
      helperText,
      defaultValue,
      onChange,
      className = '',
    },
    ref
  ) => {
    const [value, setValue] = useState(defaultValue || '');
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    const isValid = validateBchAddress(value);
    const showError = touched && (internalError || externalError);

  useEffect(() => {
    if (onChange) {
      onChange(value, isValid);
    }
  }, [value, isValid, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (touched && newValue) {
      if (!validateBchAddress(newValue)) {
        setInternalError('Invalid Bitcoin Cash address format');
      } else {
        setInternalError(null);
      }
    } else {
      setInternalError(null);
    }
  };

  const handleBlur = () => {
    setTouched(true);

    if (value && !isValid) {
      setInternalError('Invalid Bitcoin Cash address format');
    }
  };

  const baseClasses = `
    w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all duration-200 placeholder:text-gray-500 font-mono text-sm
    ${showError ? 'border-red-500 focus:ring-red-500/50' : isValid ? 'border-green-500/50' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={ref}
          name={name}
          type="text"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={baseClasses}
        />

        {/* Status indicator */}
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>

      {helperText && !showError && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {showError && (
        <p className="text-xs text-red-400">{externalError || internalError}</p>
      )}

      {!showError && value && (
        <p className="text-xs text-gray-500">
          {isValid ? (
            <span className="text-green-400">Valid Bitcoin Cash address</span>
          ) : (
            <span>Must be a valid BCH address (legacy or new format)</span>
          )}
        </p>
      )}
    </div>
  );
}

AddressInput.displayName = 'AddressInput';
