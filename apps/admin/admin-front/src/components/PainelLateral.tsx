import { useEffect } from 'react';
import { XIcon } from 'lucide-react';
import './PainelLateral.css';

interface PainelLateralProps {
    aberto: boolean;
    onFechar: () => void;
    titulo: string;
    subtitulo?: string;
    children: React.ReactNode;
}

function PainelLateral({ aberto, onFechar, titulo, subtitulo, children }: PainelLateralProps) {
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') onFechar();
        }

        if (aberto) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => document.removeEventListener('keydown', handleEsc);
    }, [aberto, onFechar]);

    return (
        <div className={`painel-overlay ${aberto ? 'aberto' : ''}`} onClick={onFechar}>
            <aside
                className={`painel-lateral ${aberto ? 'aberto' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="painel-header">
                    <div>
                        {subtitulo && <h4>{subtitulo}</h4>}
                        <h2>{titulo}</h2>
                    </div>
                    <button className="painel-fechar" onClick={onFechar}>
                        <XIcon size={20} />
                    </button>
                </header>

                <div className="painel-conteudo">
                    {children}
                </div>
            </aside>
        </div>
    );
}

export default PainelLateral;
