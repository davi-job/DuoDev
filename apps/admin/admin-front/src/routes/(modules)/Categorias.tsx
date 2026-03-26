import { createFileRoute } from '@tanstack/react-router';

import MesaDeDados from '../../components/MesaDeDados';
import ModuleHeader from '../../components/ModuleHeader';

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
                btnOnClick={() => console.log('Clicked')}
            />

            <MesaDeDados />
        </>
    );
}
