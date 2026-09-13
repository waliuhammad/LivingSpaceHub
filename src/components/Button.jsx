import clsx from 'clsx';

export default function Button({ children, variant = 'primary', className, ...props }) {
  const base = 'inline-flex items-center justify-center font-sans font-medium rounded-lg px-6 py-3 min-h-[44px] transition-all duration-200 cursor-pointer text-sm tracking-wide';

  const variants = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white',
    ghost: 'text-primary-700 hover:bg-primary-100',
    accent: 'bg-accent-400 text-white hover:bg-accent-500 active:bg-accent-600 shadow-md hover:shadow-lg',
    danger: 'bg-error text-white hover:opacity-90',
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
