import { createFileRoute } from '@tanstack/react-router';

import MesaDeDados from '../../components/MesaDeDados';
import ModuleHeader from '../../components/ModuleHeader';
import StatusPill from '../../components/StatusPill';

import './Categorias.css';

export const Route = createFileRoute('/(modules)/Categorias')({
    component: Categorias,
});

function Categorias() {
    return (
        <>
            <ModuleHeader
                path={['Admin', 'Categorias']}
                title={'Categorias'}
                btnLabel="Nova Categoria"
                btnOnClick={() => console.log('Nova Categoria Criada')}
            />

            <section className="data">
                <MesaDeDados
                    headers={['CATEGORIA', 'STATUS', 'TRILHAS', 'CLASSES', 'QUESTÕES', 'AÇÕES']}
                    data={[
                        ['FrontEnd', <StatusPill cor="verde" texto="Publicado" />, 3, 34, 59],
                        ['BackEnd', <StatusPill cor="amarelo" texto="Rascunho" />, 1, 12, 23],
                        ['Segurança', <StatusPill cor="vermelho" texto="Revisão" />, 5, 82, 123],
                        ['Mobile', <StatusPill cor="verde" texto="Publicado" />, 2, 90, 46],
                        ['AI', <StatusPill cor="azul" texto="Arquivado" />, 4, 67, 82],
                    ]}
                />
            </section>
        </>
    );
}
