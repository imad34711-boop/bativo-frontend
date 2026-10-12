interface SegmentItem<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  ariaLabel: string;
  value: T;
  items: SegmentItem<T>[];
  onChange: (value: T) => void;
}

export default function SegmentTabs<T extends string>({ ariaLabel, value, items, onChange }: Props<T>) {
  return (
    <nav className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1" aria-label={ariaLabel}>
      {items.map((item) => {
        const actif = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
              actif ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => onChange(item.key)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
