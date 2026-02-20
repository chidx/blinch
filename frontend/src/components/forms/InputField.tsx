/**
 * Reusable input field component with label and error handling
 */

'use client';

import { forwardRef, useState } from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'url' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  defaultValue?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const InputField = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      required = false,
      error,
      helperText,
      defaultValue,
      maxLength,
      rows = 3,
      className = '',
      value: controlledValue,
      onChange: controlledOnChange,
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (controlledOnChange) {
        controlledOnChange(e);
      } else {
        setInternalValue(e.target.value);
      }
    };

    const handleBlur = () => {
      setTouched(true);
    };

    const inputProps = {
      name,
      placeholder,
      required,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      maxLength,
    };

    const baseInputClasses = `
      w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10
      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
      transition-all duration-200 placeholder:text-gray-500
      ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
      ${className}
    `;

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {type === 'textarea' ? (
          <textarea
            {...inputProps}
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            className={baseInputClasses}
          />
        ) : (
          <input
            {...inputProps}
            ref={ref as React.RefObject<HTMLInputElement>}
            type={type}
            className={baseInputClasses}
          />
        )}

        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}

        {error && touched && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        {maxLength && type !== 'textarea' && (
          <p className="text-xs text-gray-500 text-right">
            {value.length} / {maxLength}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
