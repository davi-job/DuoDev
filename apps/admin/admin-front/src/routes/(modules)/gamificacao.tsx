import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import ModuleHeader from '../../components/ModuleHeader';
import TelaErro from '../../components/TelaErro';
import { useToast } from '../../components/Toast';
import { gamificacaoApi, type GamificationResource } from '../../api/gamificacao';
import type { GamificationOverview, GamificationRecord } from '../../types';

import './gamificacao.css';

export const Route = createFileRoute('/(modules)/gamificacao')({
    component: GamificacaoRoute,
});

type SectionConfig = {
    key: keyof GamificationOverview;
    title: string;
    resource: GamificationResource;
    description: string;
    template: Record<string, unknown>;
};

const SECTION_CONFIGS: SectionConfig[] = [
    {
        key: 'configs',
        title: 'Configurações gerais',
        resource: 'configs',
        description: 'Curva de nível, política de streak, pesos padrão e toggles globais.',
        template: { key: '', label: '', description: '', value: {} },
    },
    {
        key: 'xpRules',
        title: 'Regras de XP',
        resource: 'xp-rules',
        description: 'Define quanto cada evento concede de experiência.',
        template: { code: '', label: '', description: '', points: 0, active: true, metadata: {} },
    },
    {
        key: 'achievements',
        title: 'Badges e conquistas',
        resource: 'achievements',
        description: 'Critérios, raridade e payload de recompensa das conquistas.',
        template: {
            code: '',
            label: '',
            description: '',
            icon: '🏅',
            rarity: 'comum',
            active: true,
            criteria: {},
            rewardPayload: {},
        },
    },
    {
        key: 'cosmetics',
        title: 'Itens cosméticos',
        resource: 'cosmetics',
        description: 'Títulos, molduras, temas e selos equipáveis.',
        template: {
            code: '',
            label: '',
            description: '',
            type: 'titulo',
            rarity: 'comum',
            active: true,
            preview: {},
            unlockCondition: {},
        },
    },
    {
        key: 'missions',
        title: 'Missões',
        resource: 'missions',
        description: 'Metas diárias, semanais e sazonais com recompensas.',
        template: {
            code: '',
            label: '',
            description: '',
            icon: '🎯',
            period: 'diaria',
            targetType: '',
            targetValue: 1,
            active: true,
            criteria: {},
            rewardPayload: {},
        },
    },
    {
        key: 'seasons',
        title: 'Temporadas de ranking',
        resource: 'seasons',
        description: 'Ciclos oficiais de ranking e suas regras de pontuação.',
        template: {
            code: '',
            label: '',
            period: 'semanal',
            status: 'rascunho',
            startsAt: new Date().toISOString(),
            endsAt: new Date().toISOString(),
            scoringRules: {},
        },
    },
    {
        key: 'rewardTiers',
        title: 'Faixas de recompensa',
        resource: 'reward-tiers',
        description: 'Premiação por colocação nas temporadas.',
        template: {
            seasonId: '',
            label: '',
            placementFrom: 1,
            placementTo: 1,
            rewardPayload: {},
            cosmeticItemId: null,
        },
    },
    {
        key: 'adaptiveReviewRules',
        title: 'Regras adaptativas',
        resource: 'adaptive-rules',
        description: 'Critérios de revisão automática e recomendações.',
        template: {
            code: '',
            label: '',
            description: '',
            active: true,
            criteria: {},
            recommendationPayload: {},
        },
    },
];

function sanitizeRecordForEdit(item: GamificationRecord) {
    const {
        id,
        createdAt,
        updatedAt,
        unlockedAt,
        claimedAt,
        deliveredAt,
        readAt,
        ...editable
    } = item;

    return editable;
}

function prettyJson(value: unknown) {
    return JSON.stringify(value, null, 2);
}

function GamificacaoRoute() {
    const { mostrarToast } = useToast();
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState<SectionConfig>(SECTION_CONFIGS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [payloadText, setPayloadText] = useState(prettyJson(SECTION_CONFIGS[0].template));

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['gamification-overview'],
        queryFn: gamificacaoApi.overview,
    });

    const activeItems = useMemo(() => data?.[activeSection.key] ?? [], [activeSection, data]);

    const bootstrapMutation = useMutation({
        mutationFn: gamificacaoApi.bootstrap,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamification-overview'] });
            mostrarToast('sucesso', 'Defaults de gamificação carregados.');
        },
        onError: () => mostrarToast('erro', 'Erro ao carregar defaults de gamificação.'),
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const parsed = JSON.parse(payloadText) as Record<string, unknown>;
            if (editingId) {
                return gamificacaoApi.update(activeSection.resource, editingId, parsed);
            }
            return gamificacaoApi.create(activeSection.resource, parsed);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamification-overview'] });
            mostrarToast('sucesso', editingId ? 'Registro atualizado.' : 'Registro criado.');
            startCreate(activeSection);
        },
        onError: () => mostrarToast('erro', 'Erro ao salvar registro. Verifique o JSON e tente novamente.'),
    });

    const removeMutation = useMutation({
        mutationFn: ({ resource, id }: { resource: GamificationResource; id: string }) =>
            gamificacaoApi.remove(resource, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamification-overview'] });
            mostrarToast('sucesso', 'Registro removido.');
            if (editingId) {
                startCreate(activeSection);
            }
        },
        onError: () => mostrarToast('erro', 'Erro ao remover registro.'),
    });

    function startCreate(section: SectionConfig) {
        setActiveSection(section);
        setEditingId(null);
        setPayloadText(prettyJson(section.template));
    }

    function startEdit(section: SectionConfig, item: GamificationRecord) {
        setActiveSection(section);
        setEditingId(item.id);
        setPayloadText(prettyJson(sanitizeRecordForEdit(item)));
    }

    if (isLoading) return <div className="loading">Carregando gamificação...</div>;

    if (isError || !data) {
        return (
            <TelaErro
                mensagem="Não foi possível carregar a área de gamificação."
                onTentar={() => void refetch()}
            />
        );
    }

    return (
        <div className="gamificacao-page">
            <ModuleHeader
                path={[{ label: 'Admin', to: '/' }, { label: 'Gamificação' }]}
                title="Gamificação"
                btnLabel="Bootstrap defaults"
                btnOnClick={() => bootstrapMutation.mutate()}
                btnDisabled={bootstrapMutation.isPending}
                acoes={
                    <button className="btn-sec" onClick={() => startCreate(activeSection)}>
                        Novo registro
                    </button>
                }
            />

            <section className="gamificacao-grid">
                <aside className="gamificacao-nav">
                    {SECTION_CONFIGS.map((section) => {
                        const count = data[section.key].length;
                        const isActive = section.key === activeSection.key;

                        return (
                            <button
                                key={section.key}
                                type="button"
                                className={`gamificacao-nav-item ${isActive ? 'is-active' : ''}`}
                                onClick={() => startCreate(section)}
                            >
                                <div>
                                    <strong>{section.title}</strong>
                                    <span>{section.description}</span>
                                </div>
                                <em>{count}</em>
                            </button>
                        );
                    })}
                </aside>

                <section className="gamificacao-content">
                    <div className="gamificacao-panel">
                        <div className="gamificacao-panel-header">
                            <div>
                                <h3>{activeSection.title}</h3>
                                <p>{activeSection.description}</p>
                            </div>
                            <span>{activeItems.length} registro(s)</span>
                        </div>

                        {activeItems.length === 0 ? (
                            <p className="gamificacao-empty">Nenhum registro cadastrado nesta seção.</p>
                        ) : (
                            <div className="gamificacao-list">
                                {activeItems.map((item) => (
                                    <article key={item.id} className="gamificacao-card">
                                        <div className="gamificacao-card-head">
                                            <div>
                                                <h4>{String(item.label ?? item.code ?? item.key ?? item.id)}</h4>
                                                <p>{String(item.description ?? item.type ?? item.period ?? 'Sem descrição')}</p>
                                            </div>
                                            <div className="gamificacao-card-actions">
                                                <button type="button" onClick={() => startEdit(activeSection, item)}>
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger"
                                                    onClick={() =>
                                                        removeMutation.mutate({
                                                            resource: activeSection.resource,
                                                            id: item.id,
                                                        })
                                                    }
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                        <pre>{prettyJson(item)}</pre>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="gamificacao-editor">
                        <div className="gamificacao-panel-header">
                            <div>
                                <h3>{editingId ? 'Editar registro' : 'Novo registro'}</h3>
                                <p>
                                    Edite o payload da entidade selecionada. Campos de auditoria e datas são
                                    gerados automaticamente.
                                </p>
                            </div>
                        </div>

                        <textarea
                            value={payloadText}
                            onChange={(event) => setPayloadText(event.target.value)}
                            className="gamificacao-textarea"
                            spellCheck={false}
                        />

                        <div className="gamificacao-editor-actions">
                            <button className="btn-sec" type="button" onClick={() => startCreate(activeSection)}>
                                Limpar
                            </button>
                            <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                                {editingId ? 'Salvar alterações' : 'Criar registro'}
                            </button>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
}
