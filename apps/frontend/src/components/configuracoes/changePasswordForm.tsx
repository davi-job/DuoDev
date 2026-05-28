import { useState } from "react";
import { updateMinhaSenha } from "../../lib/api";

export default function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Todos os campos são obrigatórios');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setSaving(true);
        try {
            await updateMinhaSenha({
                senhaAtual: currentPassword,
                novaSenha: newPassword,
            });
            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao alterar senha. Verifique a senha atual.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-2xl">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-2xl">
                    Senha alterada com sucesso!
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label htmlFor="currentPassword" className="text-xs font-medium text-gray-500">
                    Senha atual
                </label>
                <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f5f5f0] border border-gray-200 rounded-2xl text-sm text-gray-800 
                        focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                    placeholder="••••••••"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-xs font-medium text-gray-500">
                    Nova senha
                </label>
                <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f5f5f0] border border-gray-200 rounded-2xl text-sm text-gray-800 
                        focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                    placeholder="Mínimo 6 caracteres"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-medium text-gray-500">
                    Confirmar nova senha
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f5f5f0] border border-gray-200 rounded-2xl text-sm text-gray-800 
                        focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                    placeholder="••••••••"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 bg-gray-100 rounded-2xl 
                        hover:bg-gray-200 transition-all duration-200"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-orange-500 
                        rounded-2xl hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Alterando...' : 'Alterar senha'}
                </button>
            </div>
        </form>
    );
}
