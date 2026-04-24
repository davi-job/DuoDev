import { useState } from 'react'
import { ReactNode } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TrailCard from './components/TrailCard'
import BlogCard from './components/BlogCard'
import StreakWidget from './components/StreakWidget'
import ProgressWidget from './components/ProgressWidget'
import Toast from './components/Toast'

/* ── SVG icons para as trilhas ── */
const JavaIcon = (): ReactNode => (
  <svg viewBox="0 0 128 128" fill="white" className="w-12 h-12">
    <path d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zM44.629 84.455s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"/>
    <path d="M69.802 61.271c6.025 6.929-1.58 13.166-1.58 13.166s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 0-42.731 10.67-22.324 34.191z"/>
    <path d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.81 49.821 8.076 90.817-3.637 77.896-9.463zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.678.72-2.678.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0 .001.359-.327.469-.617z"/>
    <path d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"/>
    <path d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"/>
  </svg>
)

const PythonIcon = (): ReactNode => (
  <svg viewBox="0 0 128 128" fill="white" className="w-12 h-12">
    <path d="M49.33 62h29.159C86.606 62 93 55.522 93 47.33v-27.66C93 11.436 86.387 5.05 77.489 4.022 72.956 3.489 68.313 3 63.5 3c-4.695 0-9.449.516-14.035 1.022C40.453 5.03 35 11.424 35 19.67V32h28v4H23.348C14.057 36 5.95 41.964 3.55 51.225c-2.798 10.61-2.924 17.22 0 28.22C5.64 87.638 11.14 92 20.348 92H27v-13.44C27 68.168 34.603 62 43.33 62h6zm-1.838-39.5c-3.663 0-6.634-2.97-6.634-6.634s2.97-6.633 6.634-6.633 6.633 2.97 6.633 6.633-2.97 6.634-6.633 6.634z"/>
    <path d="M78.67 66h-29.159C41.394 66 35 72.478 35 80.67v27.66C35 116.564 41.613 122.95 50.511 123.978c4.533.533 9.176 1.022 13.989 1.022 4.695 0 9.449-.516 14.035-1.022 9.001-1.008 14.453-7.402 14.453-15.648V104H77v-4h36.652C122.943 100 131.05 94.036 133.45 84.775c2.798-10.61 2.924-17.22 0-28.22C131.36 48.362 125.86 44 116.652 44H110v13.44c0 10.392-7.603 16.56-16.33 16.56H78.67zm1.838 39.5c3.663 0 6.634 2.97 6.634 6.634s-2.97 6.633-6.634 6.633-6.633-2.97-6.633-6.633 2.97-6.634 6.633-6.634z"/>
  </svg>
)

const DockerIcon = (): ReactNode => (
  <svg viewBox="0 0 128 128" fill="white" className="w-12 h-12">
    <path d="M124.8 52.1c-4.3-2.5-10-2.8-14.8-1.4-.6-5.2-4-9.7-8-12.9l-1.6-1.3-1.4 1.6c-2.7 3.1-3.5 8.3-3.1 12.3.3 2.9 1.2 5.9 3 8.3-1.4.8-2.9 2-4.3 2.5-2.8 1-5.9 2-8.9 2H3.9l-.3 1.6c-1 6.3-.8 16.4 5 23.9 4.5 5.8 11.2 8.7 20 8.7 19 0 33.1-8.8 39.7-24.7 2.6.1 5.2 0 7.5-.9 4.3-1.5 6.8-4.5 8.7-8.5h.6c3.9 0 12.4 0 16.7-8.3l.8-1.6-1.8-1.3z"/>
    <path d="M10.1 55.5H21v10.1H10.1zm12.4 0h10.9v10.1H22.5zm12.4 0h10.9v10.1H34.9zm12.5 0h10.9v10.1H47.4zm-24.9-12h10.9v10.1H22.5zm12.4 0h10.9v10.1H34.9zm12.5 0h10.9v10.1H47.4zm12.4 0h10.9v10.1H59.8zm0 12h10.9v10.1H59.8z"/>
  </svg>
)

/* ── Tipos ── */
interface Trail {
  name: string
  level: string
  duration: string
  progress: number
  thumbClass: string
  icon: ReactNode
}

interface Blog {
  tag: string
  title: string
  description: string
  author: string
  thumbClass: string
}

/* ── Dados ── */
const trails: Trail[] = [
  { name: 'Java',   level: 'Iniciante', duration: 'Conclusão em 10H · 2026', progress: 30, thumbClass: 'bg-gradient-to-br from-orange-500 to-amber-500', icon: <JavaIcon /> },
  { name: 'Python', level: 'Iniciante', duration: 'Conclusão em 22H · 2026', progress: 15, thumbClass: 'bg-gradient-to-br from-yellow-500 to-yellow-300', icon: <PythonIcon /> },
  { name: 'Docker', level: 'Iniciante', duration: 'Conclusão em 2H · 2026',  progress: 60, thumbClass: 'bg-gradient-to-br from-blue-600 to-sky-400',  icon: <DockerIcon /> },
]

const blogs: Blog[] = [
  { tag: 'Segurança', title: 'Como fazer a segurança do seu site?',       description: 'Já ficou na dúvida se o seu site está seguro?',               author: 'Por Arthur de Araujo Neves', thumbClass: 'bg-gradient-to-br from-green-600 to-green-400' },
  { tag: 'Back-end',  title: 'Qual tecnologia utilizar no seu back-end?', description: 'Ainda não sabe qual tecnologia utilizar no seu back-end?',     author: 'Por Natanael Marcelino',    thumbClass: 'bg-gradient-to-br from-green-500 to-emerald-400' },
  { tag: 'Mobile',    title: 'Aplicativo nativo ou React Native?',        description: 'Quando devo desenvolver um aplicativo nativo ou React Native.', author: 'Por Arthur de Araujo Neves', thumbClass: 'bg-gradient-to-br from-emerald-500 to-green-300' },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return (
    <div className="flex min-h-screen bg-gray-50 font-dm">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-52">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-screen-xl mx-auto">

            {/* Layout grid: conteúdo + widgets */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

              {/* Coluna esquerda */}
              <div className="flex flex-col gap-8">

                {/* Saudação */}
                <h1 className="font-syne text-2xl lg:text-[26px] font-semibold text-gray-900">
                  Olá Arthur, pronto para aprender? 👋
                </h1>

                {/* Trilhas */}
                <section>
                  <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                    Trilhas em andamento
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">Continue vendo suas trilhas. Não pare de aprender</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trails.map((t) => (
                      <TrailCard key={t.name} {...t} />
                    ))}
                  </div>
                </section>

                {/* Blog */}
                <section>
                  <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">Blog</h2>
                  <p className="text-sm text-gray-400 mb-4">Dicas sobre programação, segurança e muito mais</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blogs.map((b) => (
                      <BlogCard key={b.tag} {...b} />
                    ))}
                  </div>
                </section>
              </div>

              {/* Coluna direita — widgets empilhados em mobile, ao lado em xl */}
              <div className="flex flex-col gap-4">
                <StreakWidget />
                <ProgressWidget />
              </div>

            </div>
          </div>
        </main>
      </div>

      <Toast />
    </div>
  )
}
