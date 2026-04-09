import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { toast } from 'sonner'; // 1. Importar o toast
import { 
  ArrowRight, 
  Smartphone, 
  Globe, 
  Briefcase, 
  Users, 
  Search, 
  MoreHorizontal 
} from 'lucide-react';

type Reason = {
  id: string;
  label: string;
  icon: any;
  iconColor: string;
};

const reasons: Reason[] = [
  { id: 'tech', label: 'Interesse em desenvolver tecnologias usadas no dia a dia', icon: Smartphone, iconColor: '#3B82F6' },
  { id: 'internet', label: 'Contato com a área através da internet ou redes sociais', icon: Globe, iconColor: '#8B5CF6' },
  { id: 'career', label: 'Boas oportunidades de carreira e mercado de trabalho', icon: Briefcase, iconColor: '#10B981' },
  { id: 'influence', label: 'Influência de amigos, familiares ou professores', icon: Users, iconColor: '#F97316' },
  { id: 'fair', label: 'Estou aqui apenas pela feira', icon: Search, iconColor: '#EAB308' },
  { id: 'other', label: 'Outro', icon: MoreHorizontal, iconColor: '#64748B' },
];

export function InterestSelection() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedId) {
      navigate('/pagina-sucesso');
    } else {
      // 2. Notificação caso o usuário tente prosseguir sem selecionar um motivo
      toast.error('Por favor, selecione um motivo.', {
        description: 'Precisamos entender o seu interesse antes de continuar.',
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6 font-sans">
      <div className="w-full max-w-xl flex flex-col items-center">
        
        {/* HEADER */}
        <h1 className="text-xl md:text-2xl font-medium text-[#3D5A5C] mb-12 text-center leading-snug">
          Por quais motivos você se interessou <br className="hidden md:block" /> pela área?
        </h1>

        {/* LISTA DE MOTIVOS */}
        <div className="w-full border-t border-[#F0F4F4]">
          {reasons.map((reason, index) => {
            const isSelected = selectedId === reason.id;
            
            return (
              <motion.div
                key={reason.id}
                onClick={() => setSelectedId(reason.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative flex items-center justify-between py-5 cursor-pointer border-b border-[#F0F4F4] transition-colors hover:bg-[#FBFDFD]"
              >
                <div className="flex items-center gap-4 pr-4">
                  <div className="flex-shrink-0">
                    <reason.icon size={24} color={reason.iconColor} strokeWidth={1.5} />
                  </div>

                  <span className="text-sm md:text-base text-[#4A6466] font-normal leading-tight">
                    {reason.label}
                  </span>
                </div>

                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected ? 'border-[#9EEA6C] bg-[#9EEA6C]' : 'border-[#E2E8F0]'}
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* BOTÃO CONTINUAR */}
        <motion.button
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          // Removido 'disabled' para que o Sonner possa avisar o erro no clique
          className={`
            mt-12 flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all
            ${selectedId 
              ? 'bg-[#9EEA6C] text-[#244C4E] shadow-md cursor-pointer' 
              : 'bg-gray-100 text-gray-400'}
          `}
        >
          Continuar
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}