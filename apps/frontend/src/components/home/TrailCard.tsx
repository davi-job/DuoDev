import { ReactNode } from 'react'

interface TrailCardProps {
  name: string
  level: string
  duration: string
  progress: number
  thumbClass: string
  icon: ReactNode
}

export default function TrailCard({ name, level, duration, progress, thumbClass, icon }: TrailCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200">
      <div className={`h-32 flex items-center justify-center ${thumbClass}`}>
        {icon}
      </div>
      <div className="p-4">
        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-800 text-white tracking-widest uppercase mb-2">
          {level}
        </span>
        <p className="font-syne font-bold text-[15px] text-green-500 mb-0.5">{name}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{duration}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
