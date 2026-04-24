interface BlogCardProps {
  tag: string
  title: string
  description: string
  author: string
  thumbClass: string
}

export default function BlogCard({ tag, title, description, author, thumbClass }: BlogCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className={`h-24 flex items-center justify-center font-syne text-xl font-bold text-green-900 ${thumbClass}`}>
        {tag}
      </div>
      <div className="p-3">
        <p className="text-[11px] font-semibold text-green-500 mb-1">{tag}</p>
        <p className="text-[13px] font-medium text-gray-900 leading-snug mb-2">{title}</p>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-2">{description}</p>
        <p className="text-[11px] text-gray-400">{author}</p>
      </div>
    </div>
  )
}
