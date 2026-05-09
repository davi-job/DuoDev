import './CampoFormulario.css';

interface CampoFormularioProps {
    label: string;
    children: React.ReactNode;
}

function CampoFormulario({ label, children }: CampoFormularioProps) {
    return (
        <div className="campo">
            <label className="campo-label">{label}</label>
            {children}
        </div>
    );
}

export default CampoFormulario;
