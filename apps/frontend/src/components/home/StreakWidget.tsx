interface CalDay {
  n: number
  done?: boolean
  today?: boolean
  other?: boolean
}

const days: string[] = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const calDays: CalDay[] = [
  { n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: 5 },
  { n: 6, done: true }, { n: 7, done: true },
  { n: 8, done: true }, { n: 9 }, { n: 10 }, { n: 11 }, { n: 12 },
  { n: 13, today: true }, { n: 14 },
  { n: 15 }, { n: 16 }, { n: 17 }, { n: 18 }, { n: 19 }, { n: 20 }, { n: 21 },
  { n: 22 }, { n: 23 }, { n: 24 }, { n: 25 }, { n: 26 }, { n: 27 }, { n: 28 },
  { n: 29 }, { n: 30 }, { n: 31 },
  { n: 1, other: true }, { n: 2, other: true }, { n: 3, other: true }, { n: 4, other: true },
]

export default function StreakWidget() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
        🔥 Meu Streak
      </h3>

      {/* Nav mês */}
      <div className="flex items-center justify-between mb-3">
        <button className="text-gray-400 hover:bg-gray-100 rounded-lg px-2 py-0.5 transition text-lg">‹</button>
        <span className="text-sm font-medium">Março 2026</span>
        <button className="text-gray-400 hover:bg-gray-100 rounded-lg px-2 py-0.5 transition text-lg">›</button>
      </div>

      {/* Grid calendário */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {days.map((d, i) => (
          <div key={i} className="text-[11px] text-gray-400 font-medium py-1">{d}</div>
        ))}
        {calDays.map((d, i) => (
          <div
            key={i}
            className={`
              text-[12px] aspect-square flex items-center justify-center rounded-full cursor-pointer transition
              ${d.done  ? 'bg-green-400 text-white font-semibold' : ''}
              ${d.today ? 'bg-gray-900 text-white font-semibold' : ''}
              ${d.other ? 'text-gray-200' : ''}
              ${!d.done && !d.today && !d.other ? 'hover:bg-green-50 text-gray-700' : ''}
            `}
          >
            {d.n}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-[22px] font-bold text-gray-900">0</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Streak atual</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-[22px] font-bold text-gray-900">6</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Melhor streak</p>
        </div>
      </div>
    </div>
  )
}
