import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/api';
import { Lock, Eye, EyeOff } from 'lucide-react';

const passwordRules = [
    { id: 'len', label: 'Mínimo de 8 caracteres', test: (v: string) => v.length >= 8 },
    { id: 'upper', label: 'Letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
    { id: 'lower', label: 'Letra minúscula', test: (v: string) => /[a-z]/.test(v) },
    { id: 'num', label: 'Número', test: (v: string) => /\d/.test(v) },
    { id: 'sym', label: 'Símbolo especial (%, &, $, #...)', test: (v: string) => /[@$!%*?&#]/.test(v) },
];

export function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email as string;
    const resetToken = location.state?.resetToken as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allRulesPassed = passwordRules.every((r) => r.test(password));
    const passwordsMatch = password === confirmPassword;
    const isFormValid = allRulesPassed && passwordsMatch && password.length > 0;

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error('Preencha todos os campos');
            return;
        }

        if (!allRulesPassed) {
            toast.error('A senha não atende todos os requisitos de segurança');
            return;
        }

        if (!passwordsMatch) {
            toast.error('As senhas não coincidem');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/auth/reset-password`, {
                email,
                token: resetToken,
                newPassword: password,
            });

            toast.success('Senha redefinida com sucesso!');
            navigate('/login');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message || 'Erro ao redefinir senha');
            } else {
                toast.error('Erro ao redefinir senha. Tente novamente');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-8">
            <div className="flex w-[350px] flex-col justify-center gap-6">
                <motion.div
                    className="flex flex-col"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-2xl tracking-tight text-[#244C4E]">Redefinir senha</h1>
                    <p className="text-sm text-[#204749]">Digite sua nova senha</p>
                </motion.div>

                <form className="space-y-4" onSubmit={handleResetPassword}>
                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Label htmlFor="password">Nova senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Digite sua nova senha"
                                className="pl-10 pr-10 bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
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

                        <p className="text-[10px] mt-1 leading-relaxed text-gray-500">
                            <span className="font-medium text-gray-600">Requisitos para a senha são: </span>
                            <span className={passwordRules[0].test(password) ? 'text-green-600' : ''}>
                                Mínimo de 8 caracteres
                            </span>
                            ,{' '}
                            <span className={passwordRules[4].test(password) ? 'text-green-600' : ''}>
                                símbolos especiais (%, &, $, #)
                            </span>
                            ,{' '}
                            <span className={passwordRules[1].test(password) ? 'text-green-600' : ''}>
                                letras maiúsculas
                            </span>
                            ,{' '}
                            <span className={passwordRules[2].test(password) ? 'text-green-600' : ''}>
                                letras minúsculas
                            </span>{' '}
                            e <span className={passwordRules[3].test(password) ? 'text-green-600' : ''}>número</span>.
                        </p>
                    </motion.div>

                    <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirme sua nova senha"
                                className="pl-10 pr-10 bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {showConfirmPassword ? (
                                <EyeOff
                                    onClick={() => setShowConfirmPassword(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer"
                                />
                            ) : (
                                <Eye
                                    onClick={() => setShowConfirmPassword(true)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer"
                                />
                            )}
                        </div>
                        {confirmPassword && !passwordsMatch && (
                            <span className="text-xs text-red-500">As senhas não coincidem</span>
                        )}
                        {confirmPassword && passwordsMatch && password.length > 0 && (
                            <span className="text-xs text-green-600">✓ Senhas coincidem</span>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button className="w-full" type="submit" disabled={isSubmitting || !isFormValid}>
                            {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
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
