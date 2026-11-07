import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer leading-none align-middle [&_svg]:shrink-0 [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#356DF3] to-[#4F46E5] text-white shadow-md shadow-blue-500/25 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-blue-500',
        secondary:
          'bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-slate-400',
        outline:
          'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-400',
        ghost:
          'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
        subtle:
          'bg-indigo-50 text-indigo-700 border border-indigo-100/80 hover:bg-indigo-100 focus-visible:ring-indigo-400',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500',
        success:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 px-3.5 text-xs rounded-full',
        lg: 'h-12 px-7 text-base rounded-full',
        icon: 'h-8 w-8 p-0 rounded-full',
      },
      pill: {
        true: 'rounded-full',
        false: 'rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      pill: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, pill, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, pill, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
