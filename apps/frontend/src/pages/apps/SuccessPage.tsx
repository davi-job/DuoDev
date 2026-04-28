import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function SuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        
        {/* TÍTULO PRINCIPAL */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-medium text-[#3D5A5C] mb-6"
        >
          Parabéns! Você concluiu a criação da sua conta
        </motion.h1>

        {/* DESCRIÇÃO / SUBTÍTULO */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-[#5A7173] text-sm md:text-base leading-relaxed max-w-lg mb-10"
        >
          Seu cadastro foi realizado e agora você já pode acessar a nossa plataforma. 
          Explore as trilhas de aprendizado, responda aos desafios e comece sua 
          jornada na área de tecnologia!
        </motion.p>

        {/* BOTÃO ACESSAR PLATAFORMA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center gap-2 px-8 py-3 bg-[#9EEA6C] text-[#244C4E] rounded-full font-medium transition-all hover:bg-[#8DDA5C]"
        >
          Acessar plataforma
          <ArrowRight size={18} />
        </motion.button>

      </div>
    </div>
  );
}