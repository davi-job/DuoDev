import { useCallback, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import MesaDeDados from '../../components/MesaDeDados';
import ModuleHeader from '../../components/ModuleHeader';
import StatusPill from '../../components/StatusPill';
import DataBox from '../../components/DataBox';
import BarraFiltros, { type AbaFiltro } from '../../components/BarraFiltros';
import PainelLateral from '../../components/PainelLateral';
import FormularioCategoria from '../../components/FormularioCategoria';
import CelulaCategoria from '../../components/CelulaCategoria';
import DialogoConfirmacao from '../../components/DialogoConfirmacao';
import { useToast } from '../../components/Toast';

import { categorias as categoriasIniciais } from '../../data/mockCategorias';
import { STATUS_CONFIG, type Categoria, type StatusCategoria } from '../../types';

import './Categorias.css';

export const Route = createFileRoute('/(modules)/Categorias')({
    component: Categorias,
});

function Categorias() {
    const { mostrarToast } = useToast();
    const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
    const [abaAtiva, setAbaAtiva] = useState('todos');
    const [termoBusca, setTermoBusca] = useState('');

    const [painelAberto, setPainelAberto] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<Categoria | undefined>(undefined);
    const [painelKey, setPainelKey] = useState(0);

    // Diálogo de exclusão
    const [categoriaExcluindo, setCategoriaExcluindo] = useState<Categoria | undefined>(undefined);

    const abas: AbaFiltro[] = [
        { valor: 'todos', label: 'Todos', quantidade: categorias.length },
        ...Object.entries(STATUS_CONFIG).map(([valor, cfg]) => ({
            valor,
            label: cfg.label,
            quantidade: categorias.filter((c) => c.status === valor).length,
        })),
    ];

    const categoriasFiltradas = useMemo(() => {
        return categorias.filter((cat) => {
            const passaAba = abaAtiva === 'todos' || cat.status === abaAtiva;
            const passaBusca = termoBusca === '' || cat.nome.toLowerCase().includes(termoBusca.toLowerCase());
            return passaAba && passaBusca;
        });
    }, [categorias, abaAtiva, termoBusca]);

    const totalCategorias = categorias.length;
    const totalPublicadas = categorias.filter((c) => c.status === 'publicado').length;
    const totalTrilhas = categorias.reduce((acc, c) => acc + c.totalTrilhas, 0);
    const totalAulas = categorias.reduce((acc, c) => acc + c.totalAulas, 0);
    const totalQuestoes = categorias.reduce((acc, c) => acc + c.totalQuestoes, 0);

    const dadosTabela = categoriasFiltradas.map((cat) => {
        const cfg = STATUS_CONFIG[cat.status as StatusCategoria];
        return [
            <CelulaCategoria nome={cat.nome} icone={cat.icone} corDestaque={cat.corDestaque} />,
            <StatusPill cor={cfg.cor} texto={cfg.label} />,
            cat.totalTrilhas,
            cat.totalAulas,
            cat.totalQuestoes,
        ];
    });

    function abrirNova() {
        setCategoriaEditando(undefined);
        setPainelKey((k) => k + 1);
        setPainelAberto(true);
    }

    function abrirEdicao(indiceFiltrado: number) {
        setCategoriaEditando(categoriasFiltradas[indiceFiltrado]);
        setPainelKey((k) => k + 1);
        setPainelAberto(true);
    }

    function fecharPainel() {
        setPainelAberto(false);
        setCategoriaEditando(undefined);
    }

    const handleSalvar = useCallback(
        (
            dados: Omit<
                Categoria,
                'id' | 'criadoEm' | 'atualizadoEm' | 'totalTrilhas' | 'totalAulas' | 'totalQuestoes'
            >,
        ) => {
            if (categoriaEditando) {
                setCategorias((prev) =>
                    prev.map((cat) =>
                        cat.id === categoriaEditando.id
                            ? { ...cat, ...dados, atualizadoEm: new Date().toISOString().split('T')[0] }
                            : cat,
                    ),
                );
                mostrarToast('sucesso', `Categoria "${dados.nome}" atualizada com sucesso.`);
            } else {
                const nova: Categoria = {
                    ...dados,
                    id: String(Date.now()),
                    totalTrilhas: 0,
                    totalAulas: 0,
                    totalQuestoes: 0,
                    criadoEm: new Date().toISOString().split('T')[0],
                    atualizadoEm: new Date().toISOString().split('T')[0],
                };
                setCategorias((prev) => [nova, ...prev]);
                mostrarToast('sucesso', `Categoria "${dados.nome}" criada com sucesso.`);
            }
            fecharPainel();
        },
        [categoriaEditando],
    );

    function pedirExclusao(indiceFiltrado: number) {
        setCategoriaExcluindo(categoriasFiltradas[indiceFiltrado]);
    }

    function confirmarExclusao() {
        if (categoriaExcluindo) {
            const nome = categoriaExcluindo.nome;
            setCategorias((prev) => prev.filter((c) => c.id !== categoriaExcluindo.id));
            setCategoriaExcluindo(undefined);
            mostrarToast('sucesso', `Categoria "${nome}" excluída.`);
        }
    }

    return (
        <>
            <ModuleHeader
                path={['Admin', 'Categorias']}
                title={'Categorias'}
                btnLabel="Nova Categoria"
                btnOnClick={abrirNova}
            />

            <section className="data">
                <div className="boxList">
                    <DataBox
                        titulo="CATEGORIAS"
                        valor={String(totalCategorias)}
                        texto={`${totalPublicadas} publicadas`}
                    />
                    <DataBox titulo="TRILHAS" valor={String(totalTrilhas)} texto="Em todas as categorias" />
                    <DataBox
                        titulo="AULAS"
                        valor={String(totalAulas)}
                        texto={`Média de ${Math.round(totalAulas / totalCategorias)} por categoria`}
                    />
                    <DataBox
                        titulo="QUESTÕES"
                        valor={String(totalQuestoes)}
                        texto={`Média de ${Math.round(totalQuestoes / totalCategorias)} por categoria`}
                    />
                </div>

                <BarraFiltros
                    abas={abas}
                    abaAtiva={abaAtiva}
                    onMudarAba={setAbaAtiva}
                    termoBusca={termoBusca}
                    onMudarBusca={setTermoBusca}
                    placeholderBusca="Buscar categoria..."
                />

                <MesaDeDados
                    headers={['CATEGORIA', 'STATUS', 'TRILHAS', 'AULAS', 'QUESTÕES', 'AÇÕES']}
                    data={dadosTabela}
                    onEditar={abrirEdicao}
                    onExcluir={pedirExclusao}
                />
            </section>

            <PainelLateral
                aberto={painelAberto}
                onFechar={fecharPainel}
                titulo={categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                subtitulo="Categorias"
            >
                <FormularioCategoria
                    key={painelKey}
                    categoria={categoriaEditando}
                    onSalvar={handleSalvar}
                    onCancelar={fecharPainel}
                />
            </PainelLateral>

            <DialogoConfirmacao
                aberto={!!categoriaExcluindo}
                titulo="Excluir Categoria"
                mensagem={`Tem certeza que deseja excluir "${categoriaExcluindo?.nome}"? Esta ação não pode ser desfeita.`}
                textoBotaoConfirmar="Excluir"
                variante="perigo"
                onConfirmar={confirmarExclusao}
                onCancelar={() => setCategoriaExcluindo(undefined)}
            />
        </>
    );
}
