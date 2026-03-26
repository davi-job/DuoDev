import BotaoAcoes from './BotaoAcoes';
import './MesaDeDados.css';
import StatusPill from './StatusPill';

const dadosTeste = {
    headers: ['CATEGORIA', 'STATUS', 'TRILHAS', 'CLASSES', 'QUESTÕES', 'AÇÕES'],
    data: [
        ['FrontEnd', <StatusPill cor="verde" texto="Publicado" />, 3, 34, 59],
        ['BackEnd', <StatusPill cor="amarelo" texto="Rascunho" />, 1, 12, 23],
        ['Segurança', <StatusPill cor="vermelho" texto="Revisão" />, 5, 82, 123],
        ['Segurança', <StatusPill cor="verde" texto="Publicado" />, 2, 90, 46],
        ['Segurança', <StatusPill cor="azul" texto="Arquivado" />, 4, 67, 82],
    ],
};

function MesaDeDados() {
    return (
        <table>
            <thead>
                <tr>
                    {dadosTeste.headers.map((header, i) => (
                        <th key={i}>
                            <h4>{header}</h4>
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {dadosTeste.data.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j}>{cell}</td>
                        ))}

                        <td>
                            <BotaoAcoes />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default MesaDeDados;
