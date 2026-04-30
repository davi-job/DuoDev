import { useState } from 'react'

export default function Toast() {
  const [visible, setVisible] = useState<boolean>(true)

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-4 bg-green-50 border border-green-400 text-green-700 text-sm p-4 rounded-xl max-w-[200px] shadow-md z-50 animate-fade-in">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-green-400 hover:text-green-700 text-xs"
      >
        ✕
      </button>
      Não esqueça de avaliar o nosso projeto.
      <a href="#" className="block mt-1 font-semibold text-green-500 hover:underline">
        Avaliar agora ↗
      </a>
    </div>
  )
}
