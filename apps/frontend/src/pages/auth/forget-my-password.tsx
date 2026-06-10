import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/api';

export function ForgetMyPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();

        if (!email) {
            toast.error('Digite seu e-mail');
            return;
        }

        if (!email.includes('@')) {
            toast.error('Digite um e-mail válido');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, {
                email,
            });

            toast.success('Código enviado! Verifique seu e-mail');

            // Navega para página de verificação do código
            navigate('/verificar-codigo-redefinicao', {
                state: { email, devCode: response.data.devCode },
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || 'Erro ao enviar código');
            } else {
                toast.error('Erro ao enviar código. Tente novamente');
            }
        } finally {
            setIsSubmitting(false);
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
                    <h1 className="text-2xl tracking-tight text-[#244C4E]">Esqueci minha senha</h1>
                    <p className="text-sm text-[#204749]">
                        Digite seu e-mail institucional para receber um código de redefinição
                    </p>
                </motion.div>

                <form className="space-y-3" onSubmit={handleSendCode}>
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            disabled={isSubmitting}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Enviar código'}
                        </Button>

                        <div className="flex justify-between mt-3">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-xs text-[#244C4E] hover:underline"
                            >
                                Voltar para o login
                            </button>
                            <span className="text-xs text-[#244C4E]">Suas informações estão protegidas</span>
                        </div>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
