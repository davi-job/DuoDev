import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import './CelulaCategoria.css';

interface CelulaCategoriaProps {
    name: string;
    icon: string | null;
    thumbColor: string;
}

function CelulaCategoria({ name, icon, thumbColor }: CelulaCategoriaProps) {
    const Icone = (icons[(icon ?? '') as keyof typeof icons] as LucideIcon) ?? icons.Code;

    return (
        <div className="celula-categoria">
            <div
                className="celula-categoria-icone"
                style={{ backgroundColor: `${thumbColor}20`, color: thumbColor }}
            >
                <Icone size={18} />
            </div>
            <span className="celula-categoria-nome">{name}</span>
        </div>
    );
}

export default CelulaCategoria;
