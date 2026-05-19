interface FilterItem<Key extends string> {
  key: Key
  label: string
}

interface FilterTabsProps<Key extends string> {
  items: Array<FilterItem<Key>>
  activeKey: Key
  onChange: (key: Key) => void
  label?: string
}

export function FilterTabs<Key extends string>({
  items,
  activeKey,
  onChange,
  label = 'Filtreler',
}: FilterTabsProps<Key>) {
  return (
    <div className="pinti-panel-quiet rounded-2xl p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <div
        className="pinti-scroll-region flex gap-2 overflow-x-auto pb-1"
        tabIndex={0}
        aria-label={`${label} yatay kaydırma alanı`}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={[
              'pinti-link min-h-10 shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold',
              activeKey === item.key
                ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
