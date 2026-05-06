import { useNavigate } from 'react-router'

interface BlogCardProps {
  tag: string
  title: string
  description: string
  author: string
  thumbClass: string
}

const slugMap: Record<string, string> = {
  'Segurança': 'seguranca',
  'Back-end':  'backend',
  'Mobile':    'mobile',
}

export default function BlogCard({ tag, title, description, author, thumbClass }: BlogCardProps) {
  const navigate = useNavigate()
  const slug = slugMap[tag] ?? tag.toLowerCase()

  return (
    <div
      onClick={() => navigate(`/blog/${slug}`)}
      className="bg-white rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200"
    >
      <div className={`h-28 flex items-center justify-center font-syne text-3xl font-bold text-green-900 ${thumbClass}`}>
        {tag}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">{tag}</p>
        <p className="text-[12px] font-semibold text-gray-800 leading-snug mb-1.5">{title}</p>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{description}</p>
        <p className="text-[10px] text-gray-400">{author}</p>
      </div>
    </div>
  )
}
