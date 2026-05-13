import { ReactNode } from 'react'
import { useNavigate } from 'react-router'

interface TrailCardProps {
  name: string
  level: string
  duration: string
  progress: number
  thumbClass: string
  icon: ReactNode
}

export default function TrailCard({ name, level, duration, progress, thumbClass, icon }: TrailCardProps) {

  const navigate = useNavigate();

  const goToTrailDetails = () => {      
      navigate(`/trilha/${name}`);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200" onClick={goToTrailDetails}>
      <div className={`h-40 flex items-center justify-center ${thumbClass}`}>
        {icon}
      </div>
      <div className="p-5">
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-green-800 text-white tracking-[0.18em] uppercase mb-3">
          {level}
        </span>
        <p className="font-syne text-xl font-bold text-green-500 mb-1">{name}</p>
        <p className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-4">{duration}</p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
