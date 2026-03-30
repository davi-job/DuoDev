import { useState } from 'react';
import { motion } from 'framer-motion';
  // Corrigido de 'react-router' para 'react-router-dom'
import { ArrowRight } from 'lucide-react'; // Instale lucide-react para o ícone da seta

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
  // const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        {/* HEADER */}
        <h1 className="text-3xl font-medium text-[#3D5A5C] mb-10">
          Quero aprender
        </h1>

        {/* GRID DE SKILLS */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              onClick={() => setSelected(skill.name)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all h-32
                ${selected === skill.name 
                  ? 'border-[#9EEA6C] bg-[#F8FFF2]' 
                  : 'border-[#F0F4F4] bg-[#F8FAFA] hover:border-gray-200'}
              `}
            >
              {/* Radio Button Visual */}
              <div className={`
                absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${selected === skill.name ? 'border-[#9EEA6C]' : 'border-gray-200'}
              `}>
                {selected === skill.name && <div className="w-2 h-2 bg-[#9EEA6C] rounded-full" />}
              </div>

              {/* Icon */}
              <img src={skill.icon} alt={skill.name} className="w-10 h-10 mb-2 object-contain" />
              
              {/* Name */}
              <span className="text-xs font-medium text-[#5A7173]">
                {skill.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* BOTÃO CONTINUAR */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selected}
          className={`
            mt-10 flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all
            ${selected 
              ? 'bg-[#9EEA6C] text-[#244C4E] shadow-lg shadow-green-100' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          Continuar
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}