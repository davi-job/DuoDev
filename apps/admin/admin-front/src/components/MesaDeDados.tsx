import './MesaDeDados.css';

function MesaDeDados() {
    return (
        <table>
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Status</th>
                    <th>Trilhas</th>
                    <th>Classes</th>
                    <th>Questões</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <th>Frontend</th>
                    <th>Publicado</th>
                    <th>3</th>
                    <th>34</th>
                    <th>59</th>
                </tr>

                <tr>
                    <th>Backend</th>
                    <th>Rascunho</th>
                    <th>1</th>
                    <th>12</th>
                    <th>23</th>
                </tr>

                <tr>
                    <th>Segurança</th>
                    <th>Publicado</th>
                    <th>5</th>
                    <th>82</th>
                    <th>123</th>
                </tr>
            </tbody>
        </table>
    );
}

export default MesaDeDados;
