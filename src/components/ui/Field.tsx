import type { LabelHTMLAttributes, ReactNode } from 'react';

interface Props extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  full?: boolean;
  children: ReactNode;
}

export default function Field({ label, full = false, className = '', children, ...rest }: Props) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium text-slate-600 ${full ? 'sm:col-span-2' : ''} ${className}`} {...rest}>
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50';
