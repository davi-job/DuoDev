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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      {/* Thumbnail */}
      <div className={`h-28 flex items-center justify-center ${thumbClass}`}>
        {icon}
      </div>
      {/* Body */}
      <div className="p-3">
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-900 text-white tracking-wide mb-2">
          {level}
        </span>
        <p className="font-syne font-semibold text-[15px] text-gray-900 mb-0.5">{name}</p>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-3">{duration}</p>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
