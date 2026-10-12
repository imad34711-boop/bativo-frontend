interface Props {
  state: 'loading' | 'empty' | 'error' | 'success';
  title: string;
  description?: string;
}

const toneClasses: Record<Props['state'], string> = {
  loading: 'border-blue-200 bg-blue-50 text-blue-800',
  empty: 'border-slate-200 bg-slate-50 text-slate-600',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function StatePanel({ state, title, description }: Props) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${toneClasses[state]}`}
      role={state === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-0.5 text-xs opacity-80">{description}</p>}
    </div>
  );
}
