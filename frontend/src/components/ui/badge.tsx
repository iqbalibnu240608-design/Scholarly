import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
        primary: 'bg-blue-50 text-blue-700 border border-blue-200/60',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
        destructive: 'bg-rose-50 text-rose-700 border border-rose-200/60',
        secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
        outline: 'border border-slate-300 text-slate-700 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
