import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ModuleHeader from '../../../components/ModuleHeader';
import FormularioCategoria from '../../../components/FormularioCategoria';
import MesaDeDados from '../../../components/MesaDeDados';
import TelaErro from '../../../components/TelaErro';
import { useToast } from '../../../components/Toast';

import { categoriasApi } from '../../../api/categorias';
import type { CreateCategoriaDto } from '../../../types';

import './$categoriaId.css';

export const Route = createFileRoute('/(modules)/conteudo/$categoriaId')({
    component: DetalheCategoria,
});

function DetalheCategoria() {
    const { categoriaId } = Route.useParams();
    const { mostrarToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const isNova = categoriaId === 'nova';

    const { data: categoria, isLoading, isError, refetch } = useQuery({
        queryKey: ['categorias', categoriaId],
        queryFn: () => categoriasApi.buscar(categoriaId),
        enabled: !isNova,
    });

    const criarMutation = useMutation({
        mutationFn: (dto: CreateCategoriaDto) => categoriasApi.criar(dto),
        onSuccess: (nova) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            mostrarToast('sucesso', `Categoria "${nova.name}" criada com sucesso.`);
            void navigate({ to: '/conteudo/$categoriaId', params: { categoriaId: nova.id }, replace: true });
        },
        onError: () => mostrarToast('erro', 'Erro ao criar categoria.'),
    });

    const atualizarMutation = useMutation({
        mutationFn: (dto: CreateCategoriaDto) => categoriasApi.atualizar(categoriaId, dto),
        onSuccess: (atualizada) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            queryClient.invalidateQueries({ queryKey: ['categorias', categoriaId] });
            mostrarToast('sucesso', `Categoria "${atualizada.name}" atualizada.`);
        },
        onError: () => mostrarToast('erro', 'Erro ao atualizar categoria.'),
    });

    function handleSalvar(dados: CreateCategoriaDto) {
        if (isNova) {
            criarMutation.mutate(dados);
        } else {
            atualizarMutation.mutate(dados);
        }
    }

    function handleCancelar() {
        void navigate({ to: '/conteudo' });
    }

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
                btnDisabled
            />

            <section className="detalhe-categoria">
                <div className="detalhe-categoria-form">
                    <h2 className="detalhe-secao-titulo">Dados da Categoria</h2>
                    <FormularioCategoria
                        categoria={categoria}
                        onSalvar={handleSalvar}
                        onCancelar={handleCancelar}
                    />
                </div>

                {!isNova && (
                    <div className="detalhe-categoria-trilhas">
                        <h2 className="detalhe-secao-titulo">Trilhas</h2>
                        <MesaDeDados
                            headers={['TRILHA', 'NÍVEL', 'STATUS', 'AULAS', 'QUESTÕES', 'AÇÕES']}
                            data={[]}
                        />
                    </div>
                )}
            </section>
        </>
    );
}
