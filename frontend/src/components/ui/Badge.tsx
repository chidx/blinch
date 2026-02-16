/**
 * Badge Component
 */

'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'primary', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        {
          'badge-primary': variant === 'primary',
          'badge-accent': variant === 'accent',
          'bg-success/20 border-success/30 text-success-light': variant === 'success',
          'bg-warning/20 border-warning/30 text-warning-light': variant === 'warning',
          'bg-error/20 border-error/30 text-error-light': variant === 'error',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
