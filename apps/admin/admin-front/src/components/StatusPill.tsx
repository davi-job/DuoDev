import { Circle } from 'lucide-react';
import './StatusPill.css';

interface pillProps {
    cor: 'verde' | 'amarelo' | 'vermelho' | 'azul';
    texto: string;
}

function StatusPill({ cor, texto }: pillProps) {
    let corBackground = '#222';
    let corTexto = '#fff';

    switch (cor) {
        case 'verde':
            corTexto = '#9eea6c';
            corBackground = 'rgba(159, 234, 108, 0.1)';
            break;
        case 'amarelo':
            corTexto = '#f59e0b';
            corBackground = 'rgba(245, 158, 11, 0.1)';
            break;
        case 'vermelho':
            corTexto = '#ef4444';
            corBackground = 'rgba(239, 68, 68, 0.1)';
            break;
        case 'azul':
            corTexto = '#3178C6';
            corBackground = 'rgba(49, 120, 198, 0.1)';
            break;
    }

    return (
        <div
            className="pill"
            style={{
                backgroundColor: corBackground,
                color: corTexto,
            }}
        >
            <Circle size={8} fill={corTexto} /> <span>{texto}</span>
        </div>
    );
}

export default StatusPill;
