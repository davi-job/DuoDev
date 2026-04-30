import { ReactNode } from 'react'

interface NavItem {
  label: string
  active?: boolean
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    active: true,
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Trilhas',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    label: 'Meus conteúdos',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Projetos',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
]

const otherItems: NavItem[] = [
  {
    label: 'Conheça o projeto',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-30 w-52
          bg-white border-r border-gray-200
          flex flex-col p-4
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="font-syne text-[22px] font-bold text-green-400 tracking-tight mb-8 pl-1">
          duo<span className="text-gray-900">dev</span>
        </div>

        {/* Nav principal */}
        <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2 pl-2">
          Aprendizado
        </p>
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-xl text-sm mb-0.5 transition-all
              ${item.active
                ? 'bg-green-50 text-green-400 font-medium'
                : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}
            `}
          >
            <span className={item.active ? 'opacity-100' : 'opacity-70'}>{item.icon}</span>
            {item.label}
          </a>
        ))}

        <hr className="border-gray-200 my-4" />

        <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2 pl-2">
          Outros
        </p>
        {otherItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all mb-0.5"
          >
            <span className="opacity-70">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </aside>
    </>
  )
}
