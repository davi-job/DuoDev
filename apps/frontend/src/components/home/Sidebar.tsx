import { ReactNode, useState } from 'react'

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
      <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    label: 'Trilhas',
    icon: (
      <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Meus conteúdos',
    icon: (
      <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: 'Projetos',
    icon: (
      <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
]

const otherItems: NavItem[] = [
  {
    label: 'Conheça o projeto',
    icon: (
      <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [toastVisible, setToastVisible] = useState(true)

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-30 w-48
          bg-white flex flex-col py-5 px-3
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="font-syne text-[20px] font-bold text-green-500 tracking-tight mb-6 px-2">
          duo<span className="text-gray-900">dev</span>
        </div>

        {/* Nav principal */}
        <p className="text-[9px] font-bold tracking-widest text-gray-300 uppercase mb-1.5 px-2 flex items-center gap-2">
          Aprendizado <span className="flex-1 h-px bg-gray-100"></span>
        </p>
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`
              flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] mb-0.5 transition-all
              ${item.active
                ? 'bg-green-50 text-green-600 font-medium'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
            `}
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}

        <p className="text-[9px] font-bold tracking-widest text-gray-300 uppercase mb-1.5 px-2 mt-4 flex items-center gap-2">
          Outros <span className="flex-1 h-px bg-gray-100"></span>
        </p>
        {otherItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all mb-0.5"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}

        {/* Toast */}
        {toastVisible && (
          <div className="mt-auto">
            <div className="bg-green-50 border border-green-100 text-xs p-3 rounded-2xl relative">
              <button
                onClick={() => setToastVisible(false)}
                className="absolute top-2 right-2 text-green-400 hover:text-green-600 text-xs"
              >✕</button>
              <p className="pr-4 mb-1 text-gray-500 leading-relaxed">Não esqueça de avaliar o nosso projeto.</p>
              <a href="#" className="font-semibold text-green-500 hover:underline">
                Avaliar agora ↗
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
