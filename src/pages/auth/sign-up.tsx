import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import { Lock, Eye, AtSign, EyeOff, User } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const signUpForm = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type SignUpForm = z.infer<typeof signUpForm>;

export function SignUp() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<SignUpForm>({
        defaultValues: {
            email: '',
            password: '',
            name: '',
        },
    });

    async function handleSignUp(data: SignUpForm) {
        try {
            // const response = await register({ email: data.email, password: data.password, name: data.name });
            console.log(data);
            toast.success('Cadastro realizado com sucesso!');
            navigate('/login');
        } catch {
            toast.error('Erro ao fazer cadastro');
        }
    }

    return (
        <div className="p-8">
            <div className="flex w-[350px] flex-col justify-center gap-6">
                <motion.div
                    className="flex flex-col"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-2xl tracking-tight text-[#244C4E]">
                        Crie sua conta na <span className="text-[#9EEA6C]">duodev</span>
                    </h1>
                    <p className="text-sm text-[#204749]">
                        Crie sua conta para aprender programação de maneira simples e de forma barata.
                    </p>
                </motion.div>

                <form className="space-y-4" onSubmit={handleSubmit(handleSignUp)}>
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Label htmlFor="name">Nome completo</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="name"
                                type="text"
                                placeholder="Digite seu nome completo"
                                className="pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                {...register('name')}
                            />
                        </div>
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </motion.div>

                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Label htmlFor="email">Email institucional</Label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@aluno.unifapce.edu.br"
                                className="pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                    </motion.div>

                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Label htmlFor="password">Senha da conta</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Digite sua senha (mínimo 6 caracteres)"
                                className="pl-10 pr-10 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                {...register('password')}
                            />
                            {showPassword ? (
                                <EyeOff
                                    onClick={() => setShowPassword(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer"
                                />
                            ) : (
                                <Eye
                                    onClick={() => setShowPassword(true)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer"
                                />
                            )}
                        </div>

                        <span className=" text-[#244C4E] text-[10px] leading-none">
                            <span className="text-[#204749]">Requisitos para a senha são:</span>{' '}
                            <span className="text-[#B2B5BD]">Mínimo de 8 caracteres</span> ,{' '}
                            <span className="text-[#B2B5BD]">símbolos especiais como (%, &, $, #)</span>,{' '}
                            <span className="text-[#B2B5BD]">letras maiúsculas</span>,{' '}
                            <span className="text-[#B2B5BD]">letras minúsculas</span> e{' '}
                            <span className="text-[#B2B5BD]">número</span>.
                        </span>
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button className="w-full" variant={'green'} disabled={isSubmitting}>
                            Criar conta agora
                        </Button>
                    </motion.div>

                    <motion.div
                        className="flex justify-center flex-col gap-2 items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Link
                            to="/login"
                            className="text-xs text-[#6ECC30] underline hover:text-[#244C4E] transition-colors"
                        >
                            Já possuo uma conta
                        </Link>
                        <span className="text-xs text-[#244C4E]">Suas informações estão protegidas</span>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
