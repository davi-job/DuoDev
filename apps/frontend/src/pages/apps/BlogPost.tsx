import { useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import Topbar from '../../components/home/Topbar'
import Sidebar from '../../components/home/Sidebar'

interface BlogPostData {
  tag: string
  title: string
  description: string
  author: string
  thumbClass: string
  content: string[]
}

const blogPosts: Record<string, BlogPostData> = {
  seguranca: {
    tag: 'Segurança',
    title: 'Como fazer a segurança do seu site?',
    description: 'Já ficou na dúvida se o seu site está seguro?',
    author: 'Por Arthur de Araujo Neves',
    thumbClass: 'bg-gradient-to-br from-green-600 to-green-400',
    content: [
      'Proteger um site não é apenas uma etapa técnica — é uma responsabilidade essencial para garantir a confiança dos usuários e a integridade das informações. Mesmo projetos pequenos podem ser alvo de ataques, por isso vale a pena adotar boas práticas desde o início.',
      'Um dos primeiros passos é utilizar HTTPS. Isso garante que os dados trafegados entre o usuário e o servidor estejam criptografados, evitando interceptações. Hoje, certificados SSL são acessíveis e fáceis de configurar, sendo praticamente obrigatórios em qualquer site.',
      'Outro ponto importante é a validação de dados. Nunca confie apenas no que vem do lado do cliente. Valide e sanitize todas as entradas no backend para evitar ataques como SQL Injection e XSS. Usar frameworks modernos já ajuda bastante, pois muitos deles oferecem proteção embutida contra esses problemas.',
      'Manter o sistema atualizado também faz diferença. Bibliotecas desatualizadas podem conter vulnerabilidades conhecidas, então é importante acompanhar atualizações e aplicar correções regularmente.',
      'Além disso, controle de acesso é fundamental. Garanta que cada usuário tenha apenas as permissões necessárias, e implemente autenticação segura, de preferência com criptografia forte como bcrypt para senhas.',
      'Por fim, monitore e registre atividades suspeitas. Ter logs bem configurados ajuda a identificar tentativas de ataque antes que causem danos reais.',
    ],
  },
  backend: {
    tag: 'Back-end',
    title: 'Qual tecnologia utilizar no seu back-end?',
    description: 'Ainda não sabe qual tecnologia utilizar no seu back-end?',
    author: 'Por Natanael Marcelino',
    thumbClass: 'bg-gradient-to-br from-green-500 to-emerald-400',
    content: [
      'Escolher a tecnologia certa para o back-end é uma das decisões mais importantes de um projeto. Essa escolha impacta diretamente na performance, escalabilidade, manutenção e na produtividade da equipe.',
      'Node.js é uma das opções mais populares atualmente. Com JavaScript no servidor, permite compartilhar código com o front-end e conta com um ecossistema enorme de bibliotecas via npm. É especialmente eficiente para aplicações em tempo real e APIs REST.',
      'Para projetos que demandam mais robustez e tipagem forte, o NestJS se destaca. Construído sobre o Node.js, traz uma arquitetura modular inspirada no Angular, facilitando a organização e escalabilidade de projetos maiores.',
      'Python com Django ou FastAPI é outra excelente escolha, especialmente se a equipe já tem familiaridade com a linguagem. O Django oferece muita coisa pronta, enquanto o FastAPI é mais leve e perfeito para APIs modernas com validação automática.',
      'Java com Spring Boot é uma opção sólida para empresas que precisam de performance e robustez em sistemas críticos. É amplamente usado no mercado corporativo e conta com uma comunidade muito ativa.',
      'No final, a melhor tecnologia é aquela que a equipe domina e que atende aos requisitos do projeto. Avalie o contexto, o time e os objetivos antes de decidir.',
    ],
  },
  mobile: {
    tag: 'Mobile',
    title: 'Aplicativo nativo ou React Native?',
    description: 'Quando devo desenvolver um aplicativo nativo ou React Native.',
    author: 'Por Arthur de Araujo Neves',
    thumbClass: 'bg-gradient-to-br from-emerald-500 to-green-300',
    content: [
      'Desenvolver um aplicativo mobile exige uma decisão importante logo no início: usar tecnologia nativa ou optar por uma solução cross-platform como o React Native? Cada abordagem tem vantagens e trade-offs que precisam ser considerados.',
      'Aplicativos nativos são desenvolvidos especificamente para uma plataforma — Swift ou Objective-C para iOS, Kotlin ou Java para Android. Eles oferecem o melhor desempenho possível, acesso completo às APIs do sistema e uma experiência de usuário mais fluida e consistente com as diretrizes de cada plataforma.',
      'O React Native, por outro lado, permite escrever um único código em JavaScript que roda em ambas as plataformas. Isso reduz o tempo de desenvolvimento e os custos, já que você não precisa de times separados para iOS e Android.',
      'Para startups e MVPs, o React Native costuma ser a escolha mais inteligente. A velocidade de desenvolvimento é maior, e é possível lançar para as duas plataformas simultaneamente com um time menor.',
      'Já para aplicativos que exigem alta performance gráfica, acesso profundo ao hardware ou funcionalidades muito específicas de cada plataforma, o desenvolvimento nativo ainda é a melhor opção.',
      'Em resumo: se o orçamento e o prazo são fatores críticos, React Native é uma excelente escolha. Se a experiência do usuário e a performance são prioridades absolutas, considere o desenvolvimento nativo.',
    ],
  },
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [liked, setLiked] = useState(false)

  const post = blogPosts[slug ?? '']

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Post não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-dm">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-52">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-2xl mx-auto">

            {/* Voltar */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Voltar
            </button>

            {/* Banner */}
            <div className={`h-40 rounded-2xl flex items-center justify-center text-2xl font-bold font-syne text-white mb-6 ${post.thumbClass}`}>
              {post.tag}
            </div>

            {/* Título e autor */}
            <h1 className="font-syne text-xl font-bold text-green-500 mb-1">{post.title}</h1>
            <p className="text-sm text-gray-500 mb-1">{post.description}</p>
            <p className="text-xs text-gray-400 mb-3">{post.author}</p>

            {/* Botão curtir */}
            <button
              onClick={() => setLiked((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition mb-6
                ${liked
                  ? 'bg-green-50 border-green-400 text-green-500'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              Curtir
            </button>

            {/* Conteúdo */}
            <div className="flex flex-col gap-4">
              {post.content.map((paragraph, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
