import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import './CelulaCategoria.css';

interface CelulaCategoriaProps {
    nome: string;
    icone: string;
    corDestaque: string;
}

function CelulaCategoria({ nome, icone, corDestaque }: CelulaCategoriaProps) {
    const Icone = (icons[icone as keyof typeof icons] as LucideIcon) ?? icons.Code;

    return (
        <div className="celula-categoria">
            <div
                className="celula-categoria-icone"
                style={{ backgroundColor: `${corDestaque}20`, color: corDestaque }}
            >
                <Icone size={18} />
            </div>
            <span className="celula-categoria-nome">{nome}</span>
        </div>
    );
}

export default CelulaCategoria;
