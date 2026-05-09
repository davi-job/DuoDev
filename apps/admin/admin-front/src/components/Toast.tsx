import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2Icon, XCircleIcon, InfoIcon, XIcon } from 'lucide-react';

import './Toast.css';

type TipoToast = 'sucesso' | 'erro' | 'info';

interface ToastItem {
    id: number;
    tipo: TipoToast;
    mensagem: string;
}

interface ToastContexto {
    mostrarToast: (tipo: TipoToast, mensagem: string) => void;
}

const ToastContext = createContext<ToastContexto>({ mostrarToast: () => {} });

export function useToast() {
    return useContext(ToastContext);
}

const ICONES: Record<TipoToast, React.ReactNode> = {
    sucesso: <CheckCircle2Icon size={18} />,
    erro: <XCircleIcon size={18} />,
    info: <InfoIcon size={18} />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const mostrarToast = useCallback((tipo: TipoToast, mensagem: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, tipo, mensagem }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    function removerToast(id: number) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.tipo}`}>
                        <span className="toast-icone">{ICONES[toast.tipo]}</span>
                        <span className="toast-mensagem">{toast.mensagem}</span>
                        <button className="toast-fechar" onClick={() => removerToast(toast.id)}>
                            <XIcon size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
