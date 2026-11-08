import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-[13px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer leading-none align-middle [&_svg]:shrink-0 [&_svg]:pointer-events-none [&_svg]:w-4 [&_svg]:h-4',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#356DF3] to-[#4F46E5] text-white shadow-md shadow-blue-500/25 hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-blue-500',
        secondary:
          'bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-slate-400',
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
        default: 'h-10 px-6 py-2 rounded-xl',
        sm: 'h-8.5 px-4.5 py-1.5 text-xs rounded-xl [&_svg]:w-3.5 [&_svg]:h-3.5',
        lg: 'h-11 px-7 py-2.5 text-sm rounded-xl [&_svg]:w-4.5 [&_svg]:h-4.5',
        icon: 'h-8.5 w-8.5 p-0 rounded-full flex items-center justify-center',
      },
      pill: {
        true: 'rounded-xl',
        false: 'rounded-lg',
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
