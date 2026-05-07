import { useState } from "react";
import type { UserProfile } from "../interfaces/interfaces";

export default function EditProfileForm({
    profile,
    onSave,
    onCancel,
}: {
    profile: UserProfile;
    onSave: (data: { name: string; email: string }) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim()) {
            setError('Nome e email são obrigatórios');
            return;
        }

        setSaving(true);
        try {
            await onSave({ name: name.trim(), email: email.trim() });
        } catch (err) {
            setError('Erro ao salvar. Tente novamente.');
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

            <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-medium text-gray-500">
                    Nome
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f5f5f0] border border-gray-200 rounded-2xl text-sm text-gray-800 
                        focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                    placeholder="Seu nome completo"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-gray-500">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f5f5f0] border border-gray-200 rounded-2xl text-sm text-gray-800 
                        focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                    placeholder="seu@email.com"
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
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-400 to-emerald-500 
                        rounded-2xl hover:shadow-lg hover:shadow-green-200 transition-all duration-200 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </div>
        </form>
    );
}