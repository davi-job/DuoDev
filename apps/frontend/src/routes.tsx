import { createBrowserRouter } from 'react-router';
import { AuthLayout } from './pages/_layouts/auth';
import { SignIn } from './pages/auth/sign-in';
import { SignUp } from './pages/auth/sign-up';
import { LanguageSelect } from './pages/apps/LanguageSelect';
import { InterestSelection } from './pages/apps/InterestSelection';
import { SuccessPage } from './pages/apps/SuccessPage';



export const router = createBrowserRouter([

    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                path: '/login',
                element: <SignIn />,
            },
            {
                path: '/cadastrar',
                element: <SignUp />,
            },
        ],
    },   
    {
        path: '/selecionar-linguagem',
        element: <LanguageSelect />,
       
    },
    
    {
        path: '/formulario-interesse',
        element: <InterestSelection />,
    },

    {
        path: '/pagina-sucesso',
        element: <SuccessPage />,
    },
]);
