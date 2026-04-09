import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import { Lock, Eye, AtSign, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudflareCheck } from '../../components/utils/CloudsfareCheck';
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios';

const signInForm = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string(),
});

type SignInForm = z.infer<typeof signInForm>;

export function SignIn() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<SignInForm>({
        resolver: zodResolver(signInForm),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function handleSignIn(data: SignInForm) {
        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email: data.email,
                password: data.password,
            });
            localStorage.setItem('access_token', response.data.access_token);
            toast.success('Login feito com sucesso');
            navigate('/');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || 'Erro ao fazer login');
            } else {
                toast.error('Erro ao fazer login');
            }
        }
    }    

    return (
        <div className="p-8">
            <div className="flex w-87.5 flex-col justify-center gap-6">
                <motion.div
                    className="flex flex-col"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-2xl tracking-tight text-[#244C4E]">
                        Boas vindas a <span className="text-[#9EEA6C]">duodev</span>
                    </h1>
                    <p className="text-sm text-[#204749]">
                        Entre na sua conta para continuar aprendendo programação de maneira simples e de forma barata.
                    </p>
                </motion.div>

                <form className="space-y-4" onSubmit={handleSubmit(handleSignIn)}>
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Label htmlFor="email">Email institucional</Label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@aluno.unifapce.edu.br"
                                className="pl-10 pr-4 bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                {...register('email')}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Label htmlFor="password">Senha da conta</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Digite sua senha"
                                className="pl-10 pr-10 bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
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
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button className="w-full" disabled={isSubmitting}>
                            Entrar agora
                        </Button>
                    </motion.div>

                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            to="/cadastrar"
                            className="text-xs text-[#6ECC30] underline hover:text-[#244C4E] transition-colors"
                        >
                            Criar conta agora
                        </Link>
                    </motion.div>
                    <CloudflareCheck />
                </form>
            </div>
        </div>
    );
}
