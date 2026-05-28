import './DataBox.css';

interface boxProps {
    titulo: string;
    valor: string;
    texto: string;
}

function DataBox({ titulo, valor, texto }: boxProps) {
    return (
        <div className="dataBox">
            <h4>{titulo}</h4>
            <p className="valor">{valor}</p>
            <p className="texto">{texto}</p>
        </div>
    );
}

export default DataBox;
