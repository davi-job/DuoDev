import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { completeOnboarding } from '../../lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

const onboardingSteps = [
  'Escolha sua linguagem',
  'Diga o que quer aprender',
  'Conclua o onboarding e receba a recompensa',
];

export function SuccessPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
      toast.success('Onboarding concluído com sucesso!');
      navigate('/home');
    } catch (error) {
      console.error('Failed to mark onboarding as complete:', error);
      toast.error('Erro ao finalizar onboarding.', {
        description: 'Por favor, tente novamente.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-white p-6 font-sans">
          <div className="w-full max-w-2xl flex flex-col items-center text-center">
              <div className="mb-8 w-full rounded-3xl border border-[#E7F2E1] bg-[#F7FBF4] px-5 py-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6ECC30]">Jornada inicial</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {onboardingSteps.map((step, index) => (
                          <div key={step} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                              <p className="text-[11px] font-semibold text-[#6ECC30]">Passo {index + 1}</p>
                              <p className="mt-1 text-sm text-[#3D5A5C]">{step}</p>
                          </div>
                      ))}
                  </div>
                  <p className="mt-3 text-sm text-[#5A7173]">
                      Recompensa de boas-vindas: 1 proteção de streak para o seu início.
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#3D5A5C]">
                      Primeira missão: concluir sua primeira trilha publicada e resgatar sua missão diária.
                  </p>
              </div>

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
                  Seu cadastro foi realizado e agora você já pode acessar a nossa plataforma. Explore as trilhas de
                  aprendizado, responda aos desafios e comece sua jornada na área de tecnologia!
              </motion.p>

              {/* BOTÃO ACESSAR PLATAFORMA */}
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleContinue}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  disabled={loading} // Disable button while loading
                  className="flex items-center gap-2 px-8 py-3 bg-[#9EEA6C] text-[#244C4E] rounded-full font-medium transition-all hover:bg-[#8DDA5C]"
              >
                  {loading ? 'Carregando...' : 'Acessar plataforma'}
                  {!loading && <ArrowRight size={18} />}
              </motion.button>
          </div>
      </div>
  );
}
