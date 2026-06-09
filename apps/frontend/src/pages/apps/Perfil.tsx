import { useState, useEffect } from 'react';
import Sidebar from '../../components/home/Sidebar';
import Topbar from '../../components/home/Topbar';
import {
    equipCosmetic,
    unequipCosmetic,
    fetchMeuPerfil,
    fetchMeuProgresso,
    fetchStreakStats,
    fetchStreakLogs,
} from '../../lib/api';
import type { StreakLog, StreakStats, UserProfile, UserTrailAPI } from '../../components/interfaces/interfaces';
import ModuleCard from '../../components/perfil/moduleCard';
import DesempenhoSection from '../../components/perfil/desempenhoSection';
import StreakSection from '../../components/perfil/streakSection';
import Avatar from '../../components/perfil/avatar';

type Tab = 'modulos' | 'desempenho' | 'streaks';

export default function Perfil() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('modulos');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [trails, setTrails] = useState<UserTrailAPI[]>([]);
    const [streakStats, setStreakStats] = useState<StreakStats>({ sequenciaAtual: 0, melhorSequencia: 0 });
    const [streakLogs, setStreakLogs] = useState<StreakLog[]>([]);
    const [equippingId, setEquippingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [userProfile, progresso, stats, logs] = await Promise.all([
                    fetchMeuPerfil(),
                    fetchMeuProgresso(),
                    fetchStreakStats(),
                    fetchStreakLogs(),
                ]);
                setProfile(userProfile);
                setTrails(progresso);
                setStreakStats(stats);
                setStreakLogs(logs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    async function reloadProfile() {
        const userProfile = await fetchMeuPerfil();
        setProfile(userProfile);
    }

    async function handleEquipCosmetic(cosmeticItemId: string) {
        try {
            setEquippingId(cosmeticItemId);
            await equipCosmetic(cosmeticItemId);
            await reloadProfile();
        } catch (error) {
            console.error('Erro ao equipar cosmético:', error);
        } finally {
            setEquippingId(null);
        }
    }

    async function handleUnequipCosmetic(cosmeticItemId: string) {
        try {
            setEquippingId(cosmeticItemId);
            await unequipCosmetic(cosmeticItemId);
            await reloadProfile();
        } catch (error) {
            console.error('Erro ao desequipar cosmético:', error);
        } finally {
            setEquippingId(null);
        }
    }

    const concluidas = trails.filter((t) => t.progressoPct >= 100).length;
    const totalAcertos = trails.reduce((s, t) => s + (t.acertos ?? Math.round(t.progressoPct * 0.8)), 0);
    const totalErros = trails.reduce((s, t) => s + (t.erros ?? Math.round(t.progressoPct * 0.3)), 0);
    const totalQ = totalAcertos + totalErros;
    const media = totalQ > 0 ? Math.round((totalAcertos / totalQ) * 100) : 0;
    const xp = profile?.gamification?.xp ?? profile?.xp ?? 0;
    const level = profile?.gamification?.level ?? 1;
    const levelTitle = profile?.gamification?.title ?? 'Aprendiz';
    const levelProgress = profile?.gamification?.progressPct ?? 0;
    const xpForNextLevel = profile?.gamification?.xpForNextLevel ?? 100;
    const xpIntoLevel = profile?.gamification?.xpIntoLevel ?? 0;
    const userName = profile?.name ?? 'Usuário';
    const userEmail = profile?.email ?? '';
    const badges = profile?.gamification?.unlockedBadges ?? [];
    const cosmetics = profile?.gamification?.inventory ?? profile?.gamification?.unlockedCosmetics ?? [];
    const lockedBadges = profile?.gamification?.lockedBadges ?? [];
    const lockedCosmetics = profile?.gamification?.lockedCosmetics ?? [];
    const equipped = profile?.gamification?.equippedCosmetics;
    const unlockedCosmeticIds = new Set(cosmetics.map((item) => item.id));
    const normalizedLockedCosmetics = lockedCosmetics.filter((item) => !unlockedCosmeticIds.has(item.id));
    const themeLabel = equipped?.theme?.label ?? null;
    const frameLabel = equipped?.frame?.label ?? null;
    const badgeLabel = equipped?.badge?.label ?? null;

    const TABS: { key: Tab; label: string; icon: string }[] = [
        { key: 'modulos', label: 'Módulos', icon: '📚' },
        { key: 'desempenho', label: 'Desempenho', icon: '📊' },
        { key: 'streaks', label: 'Streaks', icon: '🔥' },
    ];

    return (
        <div
            className="min-h-screen font-dm"
            style={{
                background:
                    themeLabel === 'Tema: Floresta Duo'
                        ? 'linear-gradient(180deg, #f4fbea 0%, #f5f5f0 38%, #f8fbf4 100%)'
                        : '#f5f5f0',
            }}
        >
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col min-h-screen lg:ml-48">
                <Topbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-screen-xl mx-auto flex flex-col gap-6">
                        {/* Hero */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                <Avatar name={userName} frameLabel={frameLabel} themeLabel={themeLabel} />

                                <div className="flex-1 min-w-0">
                                    <h1 className="font-syne text-xl font-semibold text-gray-900 truncate">
                                        {userName}
                                    </h1>
                                    {equipped?.title && (
                                        <p className="mt-1 text-sm font-medium text-emerald-700">
                                            {equipped.title.label}
                                        </p>
                                    )}
                                    {badgeLabel && (
                                        <p className="mt-1 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                            🏷️ {badgeLabel}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-400 mt-0.5 truncate">{userEmail}</p>
                                    <div className="mt-3 flex flex-col gap-2 max-w-md">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-medium text-green-700">
                                                Nível {level} • {levelTitle}
                                            </span>
                                            <span>
                                                {xpIntoLevel}/{xpForNextLevel} XP no nível atual
                                            </span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-[#eef4e8]">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-[#6ECC30] to-[#244C4E] transition-all duration-700"
                                                style={{ width: `${levelProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-full font-medium border border-orange-100">
                                            🔥 {streakStats.sequenciaAtual} dias seguidos
                                        </span>
                                        <span className="text-xs bg-amber-50 text-amber-500 px-3 py-1 rounded-full font-medium border border-amber-100">
                                            ⭐ Melhor: {streakStats.melhorSequencia} dias
                                        </span>
                                        <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium border border-green-100">
                                            ✅ {concluidas} trilha{concluidas !== 1 ? 's' : ''} concluída
                                            {concluidas !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                    {[
                                        { value: xp, label: 'XP total', color: 'text-emerald-600' },
                                        { value: `${media}%`, label: 'Média acertos', color: 'text-green-500' },
                                        { value: trails.length, label: 'Trilhas', color: 'text-blue-500' },
                                        { value: badges.length, label: 'Badges', color: 'text-amber-500' },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className="flex flex-col items-center gap-0.5 bg-[#f5f5f0] rounded-2xl px-4 py-3 min-w-[72px]"
                                        >
                                            <span className={`font-syne text-xl font-bold ${s.color}`}>{s.value}</span>
                                            <span className="text-xs text-gray-400 text-center leading-tight">
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-syne text-base font-semibold text-gray-900">
                                            Badges desbloqueados
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Marcos que mostram sua constância e domínio.
                                        </p>
                                    </div>
                                    <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full font-medium">
                                        {badges.length} conquista{badges.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {badges.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        Seus primeiros badges aparecem conforme você estuda e mantém streak.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {badges.map((badge) => (
                                            <div
                                                key={badge.id}
                                                className="rounded-2xl border border-gray-100 bg-[#f9fbf5] p-4 flex items-start gap-3"
                                            >
                                                <span className="text-2xl">{badge.icon}</span>
                                                <div>
                                                    <p className="font-medium text-gray-800">{badge.label}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <h2 className="font-syne text-base font-semibold text-gray-900">
                                        Recompensas cosméticas
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Itens visuais liberados sem impactar a aprendizagem.
                                    </p>
                                </div>

                                {cosmetics.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        Continue avançando para liberar títulos, molduras e temas.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f8fbf4] p-3 text-xs text-gray-600">
                                            <div>
                                                <span className="font-medium text-gray-800">Título:</span>{' '}
                                                {equipped?.title?.label ?? 'Nenhum'}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-800">Moldura:</span>{' '}
                                                {equipped?.frame?.label ?? 'Nenhuma'}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-800">Tema:</span>{' '}
                                                {equipped?.theme?.label ?? 'Nenhum'}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-800">Selo:</span>{' '}
                                                {equipped?.badge?.label ?? 'Nenhum'}
                                            </div>
                                        </div>
                                        {cosmetics.map((reward) => (
                                            <div key={reward.id} className="rounded-2xl bg-[#f5f5f0] px-4 py-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{reward.label}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={equippingId === reward.id}
                                                        onClick={() =>
                                                            reward.equipped
                                                                ? void handleUnequipCosmetic(reward.id)
                                                                : void handleEquipCosmetic(reward.id)
                                                        }
                                                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                                                            reward.equipped
                                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                                    >
                                                        {reward.equipped
                                                            ? 'Desequipar'
                                                            : equippingId === reward.id
                                                              ? 'Equipando...'
                                                              : 'Equipar'}
                                                    </button>
                                                </div>
                                                {!reward.equipped && (
                                                    <p className="mt-2 text-[11px] text-gray-400">
                                                        Desbloqueado. Você pode equipar agora.
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-syne text-base font-semibold text-gray-900">
                                            Badges bloqueados
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Conquistas que ainda não estão liberadas na sua conta.
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full font-medium">
                                        {lockedBadges.length} bloqueado{lockedBadges.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {lockedBadges.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        Você já desbloqueou todos os badges visíveis nesta fase.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {lockedBadges.map((badge) => (
                                            <div
                                                key={badge.id}
                                                className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 flex items-start gap-3 opacity-90"
                                            >
                                                <span className="text-2xl grayscale">🔒 {badge.icon}</span>
                                                <div>
                                                    <p className="font-medium text-gray-800">{badge.label}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-syne text-base font-semibold text-gray-900">
                                            Cosméticos bloqueados
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Itens que você ainda não liberou para equipar.
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full font-medium">
                                        {lockedCosmetics.length} bloqueado{lockedCosmetics.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {normalizedLockedCosmetics.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        Nenhum cosmético bloqueado no momento. Continue avançando para liberar mais itens.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {normalizedLockedCosmetics.map((reward) => (
                                            <div
                                                key={reward.id}
                                                className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            🔒 {reward.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {reward.description}
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                                                        {reward.type === 'title'
                                                            ? 'Título'
                                                            : reward.type === 'frame'
                                                              ? 'Moldura'
                                                              : reward.type === 'theme'
                                                                ? 'Tema'
                                                                : 'Selo'}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[11px] text-gray-400">
                                                    Bloqueado. Continue estudando para liberar.
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        tab === t.key
                                            ? 'bg-green-400 text-white shadow-sm'
                                            : 'text-gray-400 hover:text-gray-700'
                                    }`}
                                >
                                    <span>{t.icon}</span>
                                    <span className="hidden sm:inline">{t.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo */}
                        {loading ? (
                            <p className="text-sm text-gray-400">Carregando...</p>
                        ) : (
                            <>
                                {tab === 'modulos' && (
                                    <section className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                                                Seus Módulos
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Todos os módulos em andamento ou concluídos
                                            </p>
                                        </div>
                                        {trails.length === 0 ? (
                                            <p className="text-sm text-gray-400">Nenhum módulo iniciado ainda.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {trails.map((t) => (
                                                    <ModuleCard key={t.trail.id} trail={t} />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {tab === 'desempenho' && (
                                    <section className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                                                Desempenho
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Média de acertos, erros e onde melhorar
                                            </p>
                                        </div>
                                        <DesempenhoSection trails={trails} />
                                    </section>
                                )}

                                {tab === 'streaks' && (
                                    <section className="flex flex-col gap-4">
                                        <div>
                                            <h2 className="font-syne text-lg font-semibold text-green-400 mb-1">
                                                Streaks de Estudo
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                Acompanhe sua consistência de estudos
                                            </p>
                                        </div>
                                        <StreakSection stats={streakStats} logs={streakLogs} />
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
