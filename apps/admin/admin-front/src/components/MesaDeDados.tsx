import BotaoAcoes from './BotaoAcoes';
import './MesaDeDados.css';

interface mesaProps {
    headers: Array<string>;
    data: Array<Array<any>>;
}

function MesaDeDados({ headers, data }: mesaProps) {
    return (
        <table>
            <thead>
                <tr>
                    {headers.map((header, i) => (
                        <th key={i}>
                            <h4>{header}</h4>
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {data.map((row, i) => (
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
