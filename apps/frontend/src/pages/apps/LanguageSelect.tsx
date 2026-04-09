import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner'; // 1. Importar o toast

type Skill = {
  name: string;
  icon: string;
};

const skills: Skill[] = [
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Javascript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'Django', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
  { name: 'PHP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
  { name: 'CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'Github', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
];

export function LanguageSelect() {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((name) => name !== skillName)
        : [...prev, skillName]
    );
  };

  const hasSelection = selectedSkills.length > 0;

  const handleContinue = () => {
    if (hasSelection) {
      navigate('/formulario-interesse');
    } else {
      // 2. Disparar erro caso não haja seleção
      toast.error('Selecione pelo menos uma linguagem para continuar.', {
        description: 'Você precisa escolher o que deseja aprender.',
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        <h1 className="text-2xl md:text-3xl font-medium text-[#3D5A5C] mb-8 md:mb-10 text-center">
          Quero aprender
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
          {skills.map((skill, index) => {
            const isSelected = selectedSkills.includes(skill.name);
            
            return (
              <motion.div
                key={skill.name}
                onClick={() => toggleSkill(skill.name)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all h-28 md:h-32
                  ${isSelected 
                    ? 'border-[#9EEA6C] bg-[#F8FFF2]' 
                    : 'border-[#F0F4F4] bg-[#F8FAFA] hover:border-gray-200'}
                `}
              >
                <div className={`
                  absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isSelected ? 'border-[#9EEA6C] bg-[#9EEA6C]' : 'border-gray-200'}
                `}>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>

                <img src={skill.icon} alt={skill.name} className="w-8 h-8 md:w-10 md:h-10 mb-2 object-contain" />
                
                <span className="text-[10px] md:text-xs font-medium text-[#5A7173] capitalize tracking-wider">
                  {skill.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="w-full flex justify-center mt-10">
          <motion.button
            onClick={handleContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // Removido o 'disabled' para permitir o clique que dispara o toast
            className={`
              flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold transition-all w-full md:w-auto
              ${hasSelection 
                ? 'bg-[#9EEA6C] text-[#244C4E] shadow-lg shadow-green-100' 
                : 'bg-gray-200 text-gray-400'} 
            `}
          >
            Continuar
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}