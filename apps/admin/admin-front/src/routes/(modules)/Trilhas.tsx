import { createFileRoute } from '@tanstack/react-router';

import MesaDeDados from '../../components/MesaDeDados';
import ModuleHeader from '../../components/ModuleHeader';
import StatusPill from '../../components/StatusPill';

import './Trilhas.css';
import DataBox from '../../components/DataBox';

export const Route = createFileRoute('/(modules)/Trilhas')({
    component: Trilhas,
});

function Trilhas() {
    return (
        <>
            <ModuleHeader
                path={['Admin', 'Trilhas']}
                title={'Trilhas'}
                btnLabel="Nova Trilha"
                btnOnClick={() => console.log('Nova Trilha Criada')}
            />

            <section className="data">
                <div className="boxList">
                    <DataBox titulo="TOTAL DE CATEGORIAS" valor="5" texto="2 Publicadas" />
                    <DataBox titulo="TOTAL DE TRILHAS" valor="15" texto="Em todas as categorias" />
                    <DataBox titulo="TOTAL DE AULAS" valor="285" texto="Média de 57 por categoria" />
                    <DataBox titulo="TOTAL DE QUESTÕES" valor="333" texto="Média de 67 por categoria" />
                </div>
                <MesaDeDados
                    headers={['TRILHA', 'STATUS', 'QUESTÕES', 'CLASSES', 'TAXA DE SUCESSO', 'AÇÕES']}
                    data={[
                        ['FrontEnd', <StatusPill cor="verde" texto="Publicado" />, 59, 34, 67],
                        ['BackEnd', <StatusPill cor="amarelo" texto="Rascunho" />, 23, 12, 54],
                        ['Segurança', <StatusPill cor="vermelho" texto="Revisão" />, 123, 82, 81],
                        ['Mobile', <StatusPill cor="verde" texto="Publicado" />, 46, 90, 93],
                        ['AI', <StatusPill cor="azul" texto="Arquivado" />, 82, 67, 26],
                    ]}
                />
            </section>
        </>
    );
}
