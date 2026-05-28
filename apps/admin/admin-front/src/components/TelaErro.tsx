import { ServerCrashIcon, RefreshCwIcon } from 'lucide-react';
import './TelaErro.css';

interface TelaErroProps {
    titulo?: string;
    mensagem?: string;
    onTentar?: () => void;
}

function TelaErro({
    titulo = 'Algo deu errado',
    mensagem = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
    onTentar,
}: TelaErroProps) {
    return (
        <div className="tela-erro">
            <div className="tela-erro-card">
                <div className="tela-erro-icone">
                    <ServerCrashIcon size={32} />
                </div>
                <div className="tela-erro-texto">
                    <h3 className="tela-erro-titulo">{titulo}</h3>
                    <p className="tela-erro-mensagem">{mensagem}</p>
                </div>
                {onTentar && (
                    <button className="tela-erro-btn" onClick={onTentar}>
                        <RefreshCwIcon size={15} />
                        Tentar novamente
                    </button>
                )}
            </div>
        </div>
    );
}

export default TelaErro;
