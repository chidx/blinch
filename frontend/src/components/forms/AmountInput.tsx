/**
 * BCH amount input with validation
 */

'use client';

import { forwardRef, useState, useEffect } from 'react';

interface AmountInputProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  defaultValue?: string;
  allowCustom?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      label,
      name,
      placeholder = '0.01',
      required = false,
      error: externalError,
      helperText,
      defaultValue,
      allowCustom = false,
      className = '',
      value: controlledValue,
      onChange: controlledOnChange,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const [touched, setTouched] = useState(false);
    const [customAmount, setCustomAmount] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;

  const showError = touched && (internalError || externalError);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    // Call controlled onChange if provided
    if (controlledOnChange) {
      controlledOnChange(e);
    }

    if (touched && newValue) {
      const num = parseFloat(newValue);
      if (isNaN(num) || num <= 0) {
        setInternalError('Amount must be a positive number');
      } else if (num > 1000000) {
        setInternalError('Amount seems too large');
      } else {
        setInternalError(null);
      }
    } else {
      setInternalError(null);
    }
  };

  const handleBlur = () => {
    setTouched(true);

    if (value) {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        setInternalError('Amount must be a positive number');
      }
    }
  };

  const handlePresetClick = (presetAmount: string) => {
    if (controlledValue === undefined) {
      setInternalValue(presetAmount);
    } else if (controlledOnChange) {
      // Create a synthetic event for controlled mode
      const syntheticEvent = {
        target: { value: presetAmount },
      } as React.ChangeEvent<HTMLInputElement>;
      controlledOnChange(syntheticEvent);
    }
    setCustomAmount(false);
    setInternalError(null);
  };

  const handleCustomToggle = () => {
    if (allowCustom) {
      setCustomAmount(!customAmount);
      const newValue = !customAmount ? '' : '0.01';
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      } else if (controlledOnChange && newValue) {
        const syntheticEvent = {
          target: { value: newValue },
        } as React.ChangeEvent<HTMLInputElement>;
        controlledOnChange(syntheticEvent);
      }
    }
  };

  const baseClasses = `
    w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all duration-200 placeholder:text-gray-500 font-mono
    ${showError ? 'border-red-500 focus:ring-red-500/50' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Preset amounts */}
      {!customAmount && (
        <div className="flex gap-2 mb-2">
          {['0.01', '0.1', '1', '10'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={`
                px-3 py-2 rounded-lg font-mono text-sm transition-all
                ${value === preset
                  ? 'bg-primary text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }
              `}
            >
              {preset} BCH
            </button>
          ))}
          {allowCustom && (
            <button
              type="button"
              onClick={handleCustomToggle}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition-all"
            >
              Custom
            </button>
          )}
        </div>
      )}

      {customAmount && (
        <button
          type="button"
          onClick={handleCustomToggle}
          className="text-xs text-accent hover:text-accent/80 mb-2"
        >
          ← Use preset amounts
        </button>
      )}

      <div className="relative">
        <input
          ref={ref}
          name={name}
          type="number"
          step="0.00000001"
          min="0"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={baseClasses}
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          BCH
        </span>
      </div>

      {helperText && !showError && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {showError && (
        <p className="text-xs text-red-400">{externalError || internalError}</p>
      )}

      {!showError && value && (
        <p className="text-xs text-gray-500">
          Recipient will receive: <span className="text-white font-medium">{value} BCH</span>
        </p>
      )}
    </div>
  );
}
);

AmountInput.displayName = 'AmountInput';
