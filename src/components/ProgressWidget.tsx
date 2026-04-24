interface ProgressItem {
  label: string
  pct: number
}

const items: ProgressItem[] = [
  { label: 'Java',   pct: 30 },
  { label: 'Python', pct: 15 },
  { label: 'Docker', pct: 60 },
]

export default function ProgressWidget() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-5">
        🔥 Seu progresso
      </h3>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{item.label}</span>
              <span>{item.pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
