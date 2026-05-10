import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ModuleHeader from '../../../../components/ModuleHeader';
import FormularioCategoria from '../../../../components/FormularioCategoria';
import FormularioTrilha from '../../../../components/FormularioTrilha';
import MesaDeDados from '../../../../components/MesaDeDados';
import StatusPill from '../../../../components/StatusPill';
import PainelLateral from '../../../../components/PainelLateral';
import DialogoConfirmacao from '../../../../components/DialogoConfirmacao';
import TelaErro from '../../../../components/TelaErro';
import { useToast } from '../../../../components/Toast';

import { categoriasApi } from '../../../../api/categorias';
import { trilhasApi } from '../../../../api/trilhas';
import {
    STATUS_CONFIG,
    type CreateCategoriaDto,
    type CreateTrilhaDto,
    type Trilha,
    type StatusTrilha,
} from '../../../../types';

import '../$categoriaId.css';

export const Route = createFileRoute('/(modules)/conteudo/$categoriaId/')({
    component: DetalheCategoria,
});

function DetalheCategoria() {
    const { categoriaId } = Route.useParams();
    const { mostrarToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const isNova = categoriaId === 'nova';

    const [painelTrilhaAberto, setPainelTrilhaAberto] = useState(false);
    const [painelTrilhaKey, setPainelTrilhaKey] = useState(0);
    const [trilhaExcluindo, setTrilhaExcluindo] = useState<Trilha | undefined>(undefined);

    const { data: categoria, isLoading, isError, refetch } = useQuery({
        queryKey: ['categorias', categoriaId],
        queryFn: () => categoriasApi.buscar(categoriaId),
        enabled: !isNova,
    });

    const { data: trilhas = [] } = useQuery({
        queryKey: ['trilhas', categoriaId],
        queryFn: () => trilhasApi.listar(categoriaId),
        enabled: !isNova,
    });

    const criarCategoriaMutation = useMutation({
        mutationFn: (dto: CreateCategoriaDto) => categoriasApi.criar(dto),
        onSuccess: (nova) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            mostrarToast('sucesso', `Categoria "${nova.name}" criada com sucesso.`);
            void navigate({ to: '/conteudo/$categoriaId', params: { categoriaId: nova.id }, replace: true });
        },
        onError: () => mostrarToast('erro', 'Erro ao criar categoria.'),
    });

    const atualizarCategoriaMutation = useMutation({
        mutationFn: (dto: CreateCategoriaDto) => categoriasApi.atualizar(categoriaId, dto),
        onSuccess: (atualizada) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            queryClient.invalidateQueries({ queryKey: ['categorias', categoriaId] });
            mostrarToast('sucesso', `Categoria "${atualizada.name}" atualizada.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao atualizar categoria.'),
    });

    const criarTrilhaMutation = useMutation({
        mutationFn: (dto: CreateTrilhaDto) => trilhasApi.criar(dto),
        onSuccess: (nova) => {
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            fecharPainelTrilha();
            mostrarToast('sucesso', `Trilha "${nova.name}" criada com sucesso.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao criar trilha.'),
    });

    const removerTrilhaMutation = useMutation({
        mutationFn: (id: string) => trilhasApi.remover(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            const nome = trilhaExcluindo?.name ?? '';
            setTrilhaExcluindo(undefined);
            mostrarToast('sucesso', `Trilha "${nome}" excluída.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao excluir trilha.'),
    });

    function handleSalvarCategoria(dados: CreateCategoriaDto) {
        if (isNova) {
            criarCategoriaMutation.mutate(dados);
        } else {
            atualizarCategoriaMutation.mutate(dados);
        }
    }

    function handleCancelarCategoria() {
        void navigate({ to: '/conteudo' });
    }

    function abrirNovaTrilha() {
        setPainelTrilhaKey((k) => k + 1);
        setPainelTrilhaAberto(true);
    }

    function fecharPainelTrilha() {
        setPainelTrilhaAberto(false);
    }

    function editarTrilha(indice: number) {
        const trilha = trilhas[indice];
        if (trilha) {
            void navigate({
                to: '/conteudo/$categoriaId/$trilhaId',
                params: { categoriaId, trilhaId: trilha.id },
            });
        }
    }

    const dadosTrilhas = trilhas.map((t) => {
        const cfg = STATUS_CONFIG[t.status as StatusTrilha];
        return [
            <button
                key={t.id}
                className="celula-link"
                onClick={() => void navigate({
                    to: '/conteudo/$categoriaId/$trilhaId',
                    params: { categoriaId, trilhaId: t.id },
                })}
            >
                {t.name}
            </button>,
            t.level,
            <StatusPill cor={cfg.cor} texto={cfg.label} />,
            t.totalLessons,
            t.totalQuestions,
        ];
    });

    const titulo = isNova ? 'Nova Categoria' : (categoria?.name ?? '...');

    const path = [
        { label: 'Admin' },
        { label: 'Conteúdo', to: '/conteudo' },
        { label: titulo },
    ];

    if (!isNova && isLoading) return <div className="loading">Carregando categoria...</div>;

    if (!isNova && isError) {
        return (
            <TelaErro
                mensagem="Não foi possível carregar os dados desta categoria."
                onTentar={() => void refetch()}
            />
        );
    }

    return (
        <>
            <ModuleHeader
                path={path}
                title={titulo}
                btnLabel={isNova ? undefined : 'Nova Trilha'}
                btnOnClick={abrirNovaTrilha}
            />

            <section className="detalhe-categoria">
                <div className="detalhe-categoria-form">
                    <h2 className="detalhe-secao-titulo">Dados da Categoria</h2>
                    <FormularioCategoria
                        categoria={categoria}
                        onSalvar={handleSalvarCategoria}
                        onCancelar={handleCancelarCategoria}
                    />
                </div>

                {!isNova && (
                    <div className="detalhe-categoria-trilhas">
                        <h2 className="detalhe-secao-titulo">Trilhas</h2>
                        <MesaDeDados
                            headers={['TRILHA', 'NÍVEL', 'STATUS', 'AULAS', 'QUESTÕES', 'AÇÕES']}
                            data={dadosTrilhas}
                            onEditar={editarTrilha}
                            onExcluir={(i) => setTrilhaExcluindo(trilhas[i])}
                        />
                    </div>
                )}
            </section>

            <PainelLateral
                aberto={!isNova && painelTrilhaAberto}
                onFechar={fecharPainelTrilha}
                titulo="Nova Trilha"
                subtitulo="Preencha os dados da nova trilha"
            >
                <FormularioTrilha
                    key={painelTrilhaKey}
                    categoryId={categoriaId}
                    onSalvar={(dto) => criarTrilhaMutation.mutate(dto)}
                    onCancelar={fecharPainelTrilha}
                />
            </PainelLateral>

            <DialogoConfirmacao
                aberto={!!trilhaExcluindo}
                titulo="Excluir Trilha"
                mensagem={`Tem certeza que deseja excluir "${trilhaExcluindo?.name}"? Esta ação não pode ser desfeita.`}
                textoBotaoConfirmar="Excluir"
                variante="perigo"
                onConfirmar={() => trilhaExcluindo && removerTrilhaMutation.mutate(trilhaExcluindo.id)}
                onCancelar={() => setTrilhaExcluindo(undefined)}
            />
        </>
    );
}
