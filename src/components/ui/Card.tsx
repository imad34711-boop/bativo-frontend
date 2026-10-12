import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export default function Card({ className = '', padded = true, children, ...rest }: Props) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/60 ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
