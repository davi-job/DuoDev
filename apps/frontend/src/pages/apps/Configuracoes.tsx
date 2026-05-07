import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import { fetchMeuPerfil, updateMeuPerfil, updateMinhaSenha } from '../../lib/api';
import Avatar from '../../components/perfil/avatar';
import type { UserProfile } from '../../components/interfaces/interfaces';
import EditProfileForm from '../../components/configuracoes/editProfileForm';
import ChangePasswordForm from '../../components/configuracoes/changePasswordForm';
import InfoField from '../../components/configuracoes/infoField';
/* ── Página ── */

type Section = 'info' | 'edit-profile' | 'change-password';

export default function Configuracoes() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [section, setSection] = useState<Section>('info');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

     useEffect(() => {
         async function load() {
             try {
                 // Tentar buscar do backend primeiro
                 const data = await fetchMeuPerfil();
                 setProfile(data);
             } catch (err) {
                 console.error('Erro ao carregar perfil:', err);

                 // Fallback: tenta pegar dados do token
                 const token = localStorage.getItem('access_token');
                 if (token) {
                     try {
                         const decoded = jwtDecode<JwtPayload>(token);
                         setProfile({
                             id: decoded.sub,
                             name: decoded.name || 'Usuário',
                             email: decoded.email || '',
                         });
                     } catch {
                         setError('Erro ao carregar dados do perfil');
                     }
                 }
             } finally {
                 setLoading(false);
             }
         }
         load();
     }, []);

     const handleSaveProfile = async (data: { name: string; email: string }) => {
         const updated = await updateMeuPerfil(data);
         setProfile(updated);
         setSection('info');
     };


    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-[#f5f5f0] font-dm flex items-center justify-center">
                <p className="text-sm text-gray-400">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f0] font-dm">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-48">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-screen-md mx-auto flex flex-col gap-6">
                        {/* Cabeçalho */}
                        <div>
                            <h1 className="font-syne text-2xl font-semibold text-gray-900">Configurações</h1>
                            <p className="text-sm text-gray-400 mt-1">Gerencie suas informações pessoais e segurança</p>
                        </div>

                        {/* Navegação */}
                        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                            {[
                                { key: 'info', label: 'Informações', icon: '👤' },
                                { key: 'edit-profile', label: 'Editar Perfil', icon: '✏️' },
                                { key: 'change-password', label: 'Alterar Senha', icon: '🔒' },
                            ].map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSection(s.key as Section)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        section === s.key
                                            ? 'bg-green-400 text-white shadow-sm'
                                            : 'text-gray-400 hover:text-gray-700'
                                    }`}
                                >
                                    <span>{s.icon}</span>
                                    <span className="hidden sm:inline">{s.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo */}
                        {section === 'info' && (
                            <div className="flex flex-col gap-5">
                                {/* Card de perfil */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                        <Avatar name={profile.name} />
                                        <div className="flex-1 min-w-0">
                                            <h2 className="font-syne text-xl font-semibold text-gray-900 truncate">
                                                {profile.name}
                                            </h2>
                                            <p className="text-sm text-gray-400 mt-0.5 truncate">{profile.email}</p>
                                            
                                        </div>
                                        <button
                                            onClick={() => setSection('edit-profile')}
                                            className="shrink-0 px-4 py-2.5 text-sm font-medium text-green-500 bg-green-50 
                                                rounded-2xl hover:bg-green-100 transition-all duration-200"
                                        >
                                            ✏️ Editar
                                        </button>
                                    </div>
                                </div>

                                {/* Cards de informação */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoField label="Nome completo" value={profile.name} icon="👤" />
                                    <InfoField label="Email" value={profile.email} icon="📧" />
                                </div>

                                {/* Segurança */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">🔒</span>
                                            <div>
                                                <h3 className="font-syne text-sm font-semibold text-gray-800">
                                                    Senha de acesso
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Altere sua senha regularmente para manter sua conta segura
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSection('change-password')}
                                            className="shrink-0 px-4 py-2.5 text-sm font-medium text-amber-500 bg-amber-50 
                                                rounded-2xl hover:bg-amber-100 transition-all duration-200"
                                        >
                                            Alterar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {section === 'edit-profile' && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">✏️</span>
                                    <div>
                                        <h2 className="font-syne text-lg font-semibold text-gray-800">Editar Perfil</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Atualize seu nome e email de acesso
                                        </p>
                                    </div>
                                </div>

                                <EditProfileForm
                                    profile={profile}
                                    onSave={handleSaveProfile}
                                    onCancel={() => setSection('info')}
                                />
                            </div>
                        )}

                        {section === 'change-password' && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <h2 className="font-syne text-lg font-semibold text-gray-800">Alterar Senha</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Escolha uma senha forte com pelo menos 6 caracteres
                                        </p>
                                    </div>
                                </div>

                                <ChangePasswordForm onCancel={() => setSection('info')} />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
