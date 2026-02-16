/**
 * Card Component with glassmorphic styling
 */

'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'glass-strong' | 'glass-card';
}

export default function Card({ children, className, variant = 'glass' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        {
          glass: variant === 'glass',
          'glass-strong': variant === 'glass-strong',
          'glass-card': variant === 'glass-card',
        },
        className
      )
    }>
      {children}
    </div>
  );
}
