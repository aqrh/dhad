import {cn} from '@/lib/utils';

type BrandButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'gold';
  };

export function BrandButton({
  variant = 'primary',
  className,
  children,
  ...props
}: BrandButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]',
        'disabled:pointer-events-none disabled:opacity-50',

        variant === 'primary' && [
          'bg-[var(--brand-navy)] text-white',
          'hover:-translate-y-0.5 hover:opacity-90',
        ],

        variant === 'secondary' && [
          'bg-[var(--surface-muted)] text-[var(--text-primary)]',
          'hover:bg-[#e3ded4]',
        ],

        variant === 'outline' && [
          'border border-[var(--border-light)] bg-transparent',
          'text-[var(--text-primary)]',
          'hover:bg-white',
        ],

        variant === 'gold' && [
          'bg-[var(--brand-gold)] text-[var(--brand-navy)]',
          'hover:-translate-y-0.5 hover:brightness-95',
        ],

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}