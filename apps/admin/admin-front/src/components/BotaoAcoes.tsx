import { EllipsisVerticalIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import './BotaoAcoes.css';

interface BotaoAcoesProps {
    onEditar?: () => void;
    onExcluir?: () => void;
}

function BotaoAcoes({ onEditar, onExcluir }: BotaoAcoesProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [posicao, setPosicao] = useState({ top: 0, left: 0, paraCima: false });

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                popupRef.current && !popupRef.current.contains(e.target as Node) &&
                btnRef.current && !btnRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleToggle() {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const espacoAbaixo = window.innerHeight - rect.bottom;
            const abrirParaCima = espacoAbaixo < 150;

            setPosicao({
                top: abrirParaCima ? rect.top : rect.bottom + 4,
                left: rect.right,
                paraCima: abrirParaCima,
            });
        }
        setOpen(!open);
    }

    return (
        <>
            <button ref={btnRef} className="actionBtn-trigger" onClick={handleToggle}>
                <EllipsisVerticalIcon />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={popupRef}
                        className="popup"
                        style={{
                            top: posicao.paraCima ? undefined : posicao.top,
                            bottom: posicao.paraCima ? window.innerHeight - posicao.top : undefined,
                            left: posicao.left,
                        }}
                    >
                        <button
                            onClick={() => {
                                onEditar?.();
                                setOpen(false);
                            }}
                        >
                            Editar
                        </button>
                        <span />
                        <button
                            onClick={() => {
                                onExcluir?.();
                                setOpen(false);
                            }}
                        >
                            Excluir
                        </button>
                    </div>,
                    document.body,
                )}
        </>
    );
}

export default BotaoAcoes;
