import { SearchIcon } from 'lucide-react';
import './BarraFiltros.css';

export interface AbaFiltro {
    valor: string;
    label: string;
    quantidade?: number;
}

interface BarraFiltrosProps {
    abas: AbaFiltro[];
    abaAtiva: string;
    onMudarAba: (valor: string) => void;
    termoBusca: string;
    onMudarBusca: (termo: string) => void;
    placeholderBusca?: string;
}

function BarraFiltros({
    abas,
    abaAtiva,
    onMudarAba,
    termoBusca,
    onMudarBusca,
    placeholderBusca = 'Buscar...',
}: BarraFiltrosProps) {
    return (
        <div className="barra-filtros">
            <div className="abas">
                {abas.map((aba) => (
                    <button
                        key={aba.valor}
                        className={`aba ${abaAtiva === aba.valor ? 'aba-ativa' : ''}`}
                        onClick={() => onMudarAba(aba.valor)}
                    >
                        <span>{aba.label}</span>
                        {aba.quantidade !== undefined && (
                            <span className="aba-quantidade">{aba.quantidade}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="campo-busca">
                <SearchIcon size={16} />
                <input
                    type="text"
                    placeholder={placeholderBusca}
                    value={termoBusca}
                    onChange={(e) => onMudarBusca(e.target.value)}
                />
            </div>
        </div>
    );
}

export default BarraFiltros;
