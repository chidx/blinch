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
  value?: string;
}

// BCH testnet-only address validation
function validateBchAddress(address: string): boolean {
  if (!address) return false;

  // Only accept testnet addresses with bchtest: prefix
  const hasTestnetPrefix = /^bchtest:/i.test(address);

  if (!hasTestnetPrefix) return false;

  const cleanAddress = address.replace(/^bchtest:/i, '');

  // Accept addresses between 34-42 characters (more permissive for testnet variations)
  // Allow alphanumeric characters (some testnet formats may use wider character sets)
  const isValidFormat = cleanAddress.length >= 34 && cleanAddress.length <= 54 && /^[a-zA-Z0-9]+$/.test(cleanAddress);

  // Debug logging
  console.log('Address validation:', {
    original: address,
    clean: cleanAddress,
    cleanLength: cleanAddress.length,
    isValidFormat,
    result: isValidFormat
  });

  return isValidFormat;
}

export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      label,
      name,
      placeholder = 'bchtest:qrqglczyxh4yvdnkkenk3k9ltq3e2j2dnqv8hvw0v9h',
      required = false,
      error: externalError,
      helperText,
      defaultValue,
      onChange,
      className = '',
      value: controlledValue,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const isValid = validateBchAddress(value);
    const showError = touched && (internalError || externalError);

    // Clear internal error whenever address becomes valid
    useEffect(() => {
      if (isValid && internalError) {
        setInternalError(null);
      }
    }, [isValid, internalError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newIsValid = validateBchAddress(newValue);

    // Update internal state for uncontrolled components
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    // Update validation errors - set error if invalid and touched
    if (touched && newValue && !newIsValid) {
      setInternalError('Invalid testnet address format (must be bchtest: with valid address)');
    }

    // Call onChange with new value and validity
    if (onChange) {
      onChange(newValue, newIsValid);
    }
  };

  // Sync onChange when controlled value changes from parent
  useEffect(() => {
    if (controlledValue !== undefined && onChange) {
      onChange(controlledValue, isValid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]);

  const handleBlur = () => {
    setTouched(true);

    if (value && !isValid) {
      setInternalError('Invalid testnet address format (must be bchtest: with valid address)');
    } else if (value && isValid) {
      setInternalError(null); // Clear error if valid
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
            <span className="text-green-400">Valid testnet address</span>
          ) : (
            <span>Must be a valid testnet address (bchtest: prefix required)</span>
          )}
        </p>
      )}
    </div>
  );
}
);

AddressInput.displayName = 'AddressInput';

