import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import BotaoAcoes from './BotaoAcoes';
import './MesaDeDados.css';

interface mesaProps {
    headers: Array<string>;
    data: Array<Array<any>>;
    itensPorPagina?: number;
    onEditar?: (indice: number) => void;
    onExcluir?: (indice: number) => void;
}

function MesaDeDados({ headers, data, itensPorPagina = 5, onEditar, onExcluir }: mesaProps) {
    const [paginaAtual, setPaginaAtual] = useState(1);

    const totalPaginas = Math.max(1, Math.ceil(data.length / itensPorPagina));
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const dadosPagina = data.slice(inicio, inicio + itensPorPagina);

    if (paginaAtual > totalPaginas) {
        setPaginaAtual(1);
    }

    function irParaPagina(pagina: number) {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setPaginaAtual(pagina);
        }
    }

    return (
        <div className="mesa-container">
            <table>
                <thead>
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i}>
                                <h4>{header}</h4>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {dadosPagina.map((row, i) => {
                        const indiceReal = inicio + i;
                        return (
                            <tr key={indiceReal}>
                                {row.map((cell: any, j: number) => (
                                    <td key={j}>{cell}</td>
                                ))}

                                <td>
                                    <BotaoAcoes
                                        onEditar={() => onEditar?.(indiceReal)}
                                        onExcluir={() => onExcluir?.(indiceReal)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="paginacao">
                <span className="paginacao-info">
                    Mostrando {data.length > 0 ? inicio + 1 : 0}-{Math.min(inicio + itensPorPagina, data.length)} de{' '}
                    {data.length} resultados
                </span>

                <div className="paginacao-controles">
                    <button
                        className="paginacao-btn"
                        onClick={() => irParaPagina(paginaAtual - 1)}
                        disabled={paginaAtual === 1}
                    >
                        <ChevronLeftIcon size={16} />
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                        <button
                            key={pagina}
                            className={`paginacao-btn ${pagina === paginaAtual ? 'ativo' : ''}`}
                            onClick={() => irParaPagina(pagina)}
                        >
                            {pagina}
                        </button>
                    ))}

                    <button
                        className="paginacao-btn"
                        onClick={() => irParaPagina(paginaAtual + 1)}
                        disabled={paginaAtual === totalPaginas}
                    >
                        <ChevronRightIcon size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MesaDeDados;
