import { useState } from 'react'

interface StreakLog {
  dataRegistro: string
  concluido: boolean
}

interface StreakWidgetProps {
  sequenciaAtual: number
  melhorSequencia: number
  logs: StreakLog[]
}

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function StreakWidget({ sequenciaAtual, melhorSequencia, logs }: StreakWidgetProps) {
  const hoje = new Date()
  const [viewDate, setViewDate] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))

  const ano = viewDate.getFullYear()
  const mes = viewDate.getMonth()

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes   = new Date(ano, mes + 1, 0).getDate()

  const logDates = new Set(
    logs.filter(l => l.concluido).map(l => l.dataRegistro.split('T')[0])
  )

  const nomeMes = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const mesAtual = hoje.getMonth() === mes && hoje.getFullYear() === ano

  const cells: { n: number; done?: boolean; today?: boolean; empty?: boolean }[] = []
  for (let i = 0; i < primeiroDia; i++) cells.push({ n: 0, empty: true })
  for (let d = 1; d <= diasNoMes; d++) {
    const dateStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ n: d, done: logDates.has(dateStr), today: mesAtual && d === hoje.getDate() })
  }

  return (
    <div className="bg-white rounded-3xl p-5">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
        🔥 Meu Streak
      </h3>

      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(ano, mes - 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">‹</button>
        <span className="text-sm font-medium capitalize text-gray-700">{nomeMes}</span>
        <button onClick={() => setViewDate(new Date(ano, mes + 1, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">›</button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekDays.map((d, i) => (
          <div key={i} className="text-[11px] text-gray-400 font-medium py-1">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`
              text-[12px] aspect-square flex items-center justify-center rounded-full transition
              ${d.empty ? 'pointer-events-none' : ''}
              ${d.done ? 'bg-green-400 text-white font-semibold' : ''}
              ${d.today && !d.done ? 'bg-green-700 text-white font-semibold' : ''}
              ${!d.done && !d.today && !d.empty ? 'text-gray-700 hover:bg-green-50 cursor-pointer' : ''}
            `}
          >
            {d.empty ? '' : d.n}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <p className="text-[24px] font-bold text-gray-900">{sequenciaAtual}</p>
          <p className="text-[11px] text-gray-400">Streak atual</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <p className="text-[24px] font-bold text-gray-900">{melhorSequencia}</p>
          <p className="text-[11px] text-gray-400">Melhor streak</p>
        </div>
      </div>
    </div>
  )
}
