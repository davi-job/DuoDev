import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ModuleHeader from '../../../../components/ModuleHeader';
import FormularioTrilha from '../../../../components/FormularioTrilha';
import FormularioConteudo from '../../../../components/FormularioConteudo';
import ListaConteudo from '../../../../components/ListaConteudo';
import PainelLateral from '../../../../components/PainelLateral';
import DialogoConfirmacao from '../../../../components/DialogoConfirmacao';
import TelaErro from '../../../../components/TelaErro';
import { useToast } from '../../../../components/Toast';

import { categoriasApi } from '../../../../api/categorias';
import { trilhasApi } from '../../../../api/trilhas';
import { conteudoApi } from '../../../../api/conteudo';
import type {
    CreateTrilhaDto,
    TipoConteudo,
    ItemConteudo,
    CreateAulaDto,
    CreateQuestaoDto,
    CreateDesafioDto,
} from '../../../../types';

import './$trilhaId.css';

export const Route = createFileRoute('/(modules)/conteudo/$categoriaId/$trilhaId')({
    component: DetalheTrilha,
});

function DetalheTrilha() {
    const { categoriaId, trilhaId } = Route.useParams();
    const { mostrarToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const isNova = trilhaId === 'nova';

    const [painelAberto, setPainelAberto] = useState(false);
    const [painelKey, setPainelKey] = useState(0);
    const [itemEditando, setItemEditando] = useState<ItemConteudo | undefined>(undefined);
    const [itemExcluindo, setItemExcluindo] = useState<ItemConteudo | undefined>(undefined);

    const { data: categoria } = useQuery({
        queryKey: ['categorias', categoriaId],
        queryFn: () => categoriasApi.buscar(categoriaId),
        enabled: !isNova,
    });

    const { data: trilha, isLoading, isError, refetch } = useQuery({
        queryKey: ['trilhas', trilhaId],
        queryFn: () => trilhasApi.buscar(trilhaId),
        enabled: !isNova,
    });

    const { data: conteudo = [] } = useQuery({
        queryKey: ['conteudo', trilhaId],
        queryFn: () => conteudoApi.listar(trilhaId),
        enabled: !isNova,
    });

    const criarTrilhaMutation = useMutation({
        mutationFn: (dto: CreateTrilhaDto) => trilhasApi.criar(dto),
        onSuccess: (nova) => {
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            mostrarToast('sucesso', `Trilha "${nova.name}" criada com sucesso.`);
            void navigate({
                to: '/conteudo/$categoriaId/$trilhaId',
                params: { categoriaId, trilhaId: nova.id },
                replace: true,
            });
        },
        onError: () => mostrarToast('erro', 'Erro ao criar trilha.'),
    });

    const atualizarTrilhaMutation = useMutation({
        mutationFn: ({ categoryId: _omit, ...dto }: CreateTrilhaDto) =>
            trilhasApi.atualizar(trilhaId, dto),
        onSuccess: (atualizada) => {
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            queryClient.invalidateQueries({ queryKey: ['trilhas', trilhaId] });
            mostrarToast('sucesso', `Trilha "${atualizada.name}" atualizada.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao atualizar trilha.'),
    });

    const criarConteudoMutation = useMutation({
        mutationFn: ({ tipo, dto }: { tipo: TipoConteudo; dto: CreateAulaDto | CreateQuestaoDto | CreateDesafioDto }) => {
            switch (tipo) {
                case 'aula':    return conteudoApi.criarAula(dto as CreateAulaDto);
                case 'questao': return conteudoApi.criarQuestao(dto as CreateQuestaoDto);
                case 'desafio': return conteudoApi.criarDesafio(dto as CreateDesafioDto);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conteudo', trilhaId] });
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            fecharPainel();
            mostrarToast('sucesso', 'Conteúdo criado com sucesso.');
        },
        onError: () => mostrarToast('erro', 'Erro ao criar conteúdo.'),
    });

    const atualizarConteudoMutation = useMutation({
        mutationFn: ({ item, dto }: { item: ItemConteudo; dto: CreateAulaDto | CreateQuestaoDto | CreateDesafioDto }) => {
            const { trailId: _, order: __, ...updateDto } = dto as any;
            switch (item.type) {
                case 'aula':    return conteudoApi.atualizarAula(item.id, updateDto);
                case 'questao': return conteudoApi.atualizarQuestao(item.id, updateDto);
                case 'desafio': return conteudoApi.atualizarDesafio(item.id, updateDto);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conteudo', trilhaId] });
            fecharPainel();
            mostrarToast('sucesso', 'Conteúdo atualizado.');
        },
        onError: () => mostrarToast('erro', 'Erro ao atualizar conteúdo.'),
    });

    const removerConteudoMutation = useMutation({
        mutationFn: (item: ItemConteudo) => {
            switch (item.type) {
                case 'aula':    return conteudoApi.removerAula(item.id);
                case 'questao': return conteudoApi.removerQuestao(item.id);
                case 'desafio': return conteudoApi.removerDesafio(item.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conteudo', trilhaId] });
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            const titulo = itemExcluindo?.title ?? '';
            setItemExcluindo(undefined);
            mostrarToast('sucesso', `"${titulo}" excluído.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao excluir conteúdo.'),
    });

    const reordenarMutation = useMutation({
        mutationFn: (items: ItemConteudo[]) =>
            conteudoApi.reordenar(
                trilhaId,
                items.map((i) => ({ id: i.id, type: i.type, order: i.order })),
            ),
        onSuccess: (novaOrdem) => {
            queryClient.setQueryData(['conteudo', trilhaId], novaOrdem);
        },
        onError: () => mostrarToast('erro', 'Erro ao reordenar conteúdo.'),
    });

    function handleSalvarTrilha(dados: CreateTrilhaDto) {
        if (isNova) {
            criarTrilhaMutation.mutate(dados);
        } else {
            atualizarTrilhaMutation.mutate(dados);
        }
    }

    function handleSalvarConteudo(
        tipo: TipoConteudo,
        dto: CreateAulaDto | CreateQuestaoDto | CreateDesafioDto,
    ) {
        if (itemEditando) {
            atualizarConteudoMutation.mutate({ item: itemEditando, dto });
        } else {
            criarConteudoMutation.mutate({ tipo, dto });
        }
    }

    function abrirNovoConteudo() {
        setItemEditando(undefined);
        setPainelKey((k) => k + 1);
        setPainelAberto(true);
    }

    function abrirEdicao(item: ItemConteudo) {
        setItemEditando(item);
        setPainelKey((k) => k + 1);
        setPainelAberto(true);
    }

    function fecharPainel() {
        setPainelAberto(false);
        setItemEditando(undefined);
    }

    function handleCancelar() {
        void navigate({ to: '/conteudo/$categoriaId', params: { categoriaId } });
    }

    const tituloTrilha = isNova ? 'Nova Trilha' : (trilha?.name ?? '...');

    const path = [
        { label: 'Admin' },
        { label: 'Conteúdo', to: '/conteudo' },
        { label: categoria?.name ?? '...', to: `/conteudo/${categoriaId}` },
        { label: tituloTrilha },
    ];

    const tituloPainel = itemEditando
        ? `Editar ${itemEditando.type === 'aula' ? 'Aula' : itemEditando.type === 'questao' ? 'Questão' : 'Desafio'}`
        : 'Novo Conteúdo';

    if (!isNova && isLoading) return <div className="loading">Carregando trilha...</div>;

    if (!isNova && isError) {
        return (
            <TelaErro
                mensagem="Não foi possível carregar os dados desta trilha."
                onTentar={() => void refetch()}
            />
        );
    }

    return (
        <>
            <ModuleHeader
                path={path}
                title={tituloTrilha}
                btnLabel={isNova ? undefined : 'Novo Conteúdo'}
                btnOnClick={abrirNovoConteudo}
            />

            <section className="detalhe-trilha">
                <div className="detalhe-trilha-form">
                    <h2 className="detalhe-secao-titulo">Dados da Trilha</h2>
                    <FormularioTrilha
                        trilha={trilha}
                        categoryId={categoriaId}
                        onSalvar={handleSalvarTrilha}
                        onCancelar={handleCancelar}
                    />
                </div>

                {!isNova && (
                    <div className="detalhe-trilha-conteudo">
                        <h2 className="detalhe-secao-titulo">Conteúdo</h2>
                        <ListaConteudo
                            items={conteudo}
                            onEditar={abrirEdicao}
                            onExcluir={setItemExcluindo}
                            onReordenar={(items) => reordenarMutation.mutate(items)}
                        />
                    </div>
                )}
            </section>

            <PainelLateral
                aberto={!isNova && painelAberto}
                onFechar={fecharPainel}
                titulo={tituloPainel}
                subtitulo={itemEditando ? 'Edição rápida' : 'Preencha os dados do novo conteúdo'}
            >
                <FormularioConteudo
                    key={painelKey}
                    item={itemEditando}
                    trailId={trilhaId}
                    nextOrder={conteudo.length}
                    onSalvar={handleSalvarConteudo}
                    onCancelar={fecharPainel}
                />
            </PainelLateral>

            <DialogoConfirmacao
                aberto={!!itemExcluindo}
                titulo="Excluir Conteúdo"
                mensagem={`Tem certeza que deseja excluir "${itemExcluindo?.title}"? Esta ação não pode ser desfeita.`}
                textoBotaoConfirmar="Excluir"
                variante="perigo"
                onConfirmar={() => itemExcluindo && removerConteudoMutation.mutate(itemExcluindo)}
                onCancelar={() => setItemExcluindo(undefined)}
            />
        </>
    );
}
