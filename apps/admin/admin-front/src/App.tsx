import type { ReactElement } from 'react';
import './App.css';

const modules: Array<string> = ['Categorias', 'Trilhas', 'Aulas e Questões', 'Landing page', 'Métricas'];

function App() {
    const categoriaBotoes: Array<ReactElement> = modules.map((modulo) => {
        return <button>{modulo}</button>;
    });

    return (
        <>
            <aside>{categoriaBotoes}</aside>
            <main></main>
        </>
    );
}

export default App;
