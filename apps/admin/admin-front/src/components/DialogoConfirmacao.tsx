import { AlertTriangleIcon } from 'lucide-react';
import './DialogoConfirmacao.css';

interface DialogoConfirmacaoProps {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    textoBotaoConfirmar?: string;
    variante?: 'perigo' | 'padrao';
    onConfirmar: () => void;
    onCancelar: () => void;
}

function DialogoConfirmacao({
    aberto,
    titulo,
    mensagem,
    textoBotaoConfirmar = 'Confirmar',
    variante = 'padrao',
    onConfirmar,
    onCancelar,
}: DialogoConfirmacaoProps) {
    if (!aberto) return null;

    return (
        <div className="dialogo-overlay" onClick={onCancelar}>
            <div className="dialogo" onClick={(e) => e.stopPropagation()}>
                <div className={`dialogo-icone ${variante}`}>
                    <AlertTriangleIcon size={24} />
                </div>

                <h3 className="dialogo-titulo">{titulo}</h3>
                <p className="dialogo-mensagem">{mensagem}</p>

                <div className="dialogo-acoes">
                    <button className="dialogo-btn cancelar" onClick={onCancelar}>
                        Cancelar
                    </button>
                    <button className={`dialogo-btn confirmar ${variante}`} onClick={onConfirmar}>
                        {textoBotaoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DialogoConfirmacao;
