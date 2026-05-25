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
      <div className={`h-36 flex items-center justify-center font-syne text-4xl font-bold text-green-900 ${thumbClass}`}>
        {tag}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-green-500 uppercase tracking-[0.18em] mb-2">{tag}</p>
        <p className="text-lg font-semibold text-gray-800 leading-snug mb-2">{title}</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-3">{description}</p>
        <p className="text-xs text-gray-400">{author}</p>
      </div>
    </div>
  )
}
