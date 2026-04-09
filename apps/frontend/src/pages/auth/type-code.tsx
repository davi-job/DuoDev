import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import axios from 'axios';

export function TypeCode() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email as string;

    const [digits, setDigits] = useState(['', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        const last = value.slice(-1);
        if (last !== '' && !/^[0-9]$/.test(last)) return;

        const updated = [...digits];
        updated[index] = last;
        setDigits(updated);

        if (last !== '' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && digits[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();

        const code = digits.join('');
        if (code.length < 4) {
            toast.error('Digite o código completo');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:3000/auth/verify-code', {
                email,
                code,
            });

            localStorage.setItem('access_token', response.data.access_token);
            toast.success('Cadastro concluído!');
            navigate('/selecionar-linguagem');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || 'Código inválido');
            } else {
                toast.error('Erro ao verificar código');
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
                    <h1 className="text-2xl tracking-tight text-[#244C4E]">Quase lá!</h1>
                    <p className="text-sm text-[#204749]">Digite o código enviado no seu E-mail institucional</p>
                </motion.div>

                <form className="space-y-3" onSubmit={handleVerify}>
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 justify-center">
                            {digits.map((digit, i) => (
                                <Input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="py-9 w-14 text-center text-xl"
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            Validar código
                        </Button>
                        <div className="flex justify-center mt-3">
                            <span className="text-xs text-[#244C4E]">Suas informações estão protegidas</span>
                        </div>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
