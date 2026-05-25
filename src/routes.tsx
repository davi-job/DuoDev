import { createBrowserRouter } from 'react-router';
import { AuthLayout } from './pages/_layouts/auth';
import { SignIn } from './pages/auth/sign-in';
import { SignUp } from './pages/auth/sign-up';
import { LanguageSelect } from '../apps/frontend/src/pages/apps/LanguageSelect';
import { InterestSelection } from '../apps/frontend/src/pages/apps/InterestSelection';



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
]);
