import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ModuleHeader from '../../../../components/ModuleHeader';
import FormularioTrilha from '../../../../components/FormularioTrilha';
import TelaErro from '../../../../components/TelaErro';
import { useToast } from '../../../../components/Toast';

import { categoriasApi } from '../../../../api/categorias';
import { trilhasApi } from '../../../../api/trilhas';
import type { CreateTrilhaDto } from '../../../../types';

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

    const criarMutation = useMutation({
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

    const atualizarMutation = useMutation({
        mutationFn: ({ categoryId: _omit, ...dto }: CreateTrilhaDto) => trilhasApi.atualizar(trilhaId, dto),
        onSuccess: (atualizada) => {
            queryClient.invalidateQueries({ queryKey: ['trilhas', categoriaId] });
            queryClient.invalidateQueries({ queryKey: ['trilhas', trilhaId] });
            mostrarToast('sucesso', `Trilha "${atualizada.name}" atualizada.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao atualizar trilha.'),
    });

    function handleSalvar(dados: CreateTrilhaDto) {
        if (isNova) {
            criarMutation.mutate(dados);
        } else {
            atualizarMutation.mutate(dados);
        }
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
            <ModuleHeader path={path} title={tituloTrilha} />

            <section className="detalhe-trilha">
                <div className="detalhe-trilha-form">
                    <h2 className="detalhe-secao-titulo">Dados da Trilha</h2>
                    <FormularioTrilha
                        trilha={trilha}
                        categoryId={categoriaId}
                        onSalvar={handleSalvar}
                        onCancelar={handleCancelar}
                    />
                </div>
            </section>
        </>
    );
}
