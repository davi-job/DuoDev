
import { createBrowserRouter } from 'react-router';
import { AuthLayout } from './pages/_layouts/auth';
import { SignIn } from './pages/auth/sign-in';
import { SignUp } from './pages/auth/sign-up';
import { LanguageSelect } from './pages/apps/LanguageSelect';
import { InterestSelection } from './pages/apps/InterestSelection';
import { SuccessPage } from './pages/apps/SuccessPage';
import { TypeCode } from './pages/auth/type-code';
import AuthGuard from './components/utils/AuthGuard';
import Home from './pages/apps/Home';
import BlogPost from './pages/apps/BlogPost';
import Perfil from './pages/apps/Perfil';
import Configuracoes from './pages/apps/Configuracoes';
import Trail from './pages/apps/Trail';
import QuizGame from './pages/apps/QuizGame';


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
            {
                path: '/digitar-codigo',
                element: <TypeCode />,
            },
        ],
    },
    {
        path: '/selecionar-linguagem',
        element: (
            <AuthGuard>
                <LanguageSelect />
            </AuthGuard>
        ),
    },

    {
        path: '/formulario-interesse',
        element: (
            <AuthGuard>
                <InterestSelection />
            </AuthGuard>
        ),
    },

    {
        path: '/pagina-sucesso',
        element: (
            <AuthGuard>
                <SuccessPage />
            </AuthGuard>
        ),
    },

    {
        path: '/home',
        element: (
            <AuthGuard>
                <Home />
            </AuthGuard>
        ),
    },
    {
        path: '/blog/:slug',
        element: (
            <AuthGuard>
                <BlogPost />
            </AuthGuard>
        ),
    },
    {
        path: '/trilha/:slug',
        element: (
            <AuthGuard>
                <Trail />
            </AuthGuard>
        ),
    },
    {
        path: '/perfil',
        element: (
            <AuthGuard>
                <Perfil />
            </AuthGuard>
        ),
    },
    {
        path: '/configuracoes',
        element: (
            <AuthGuard>
                <Configuracoes />
            </AuthGuard>
        ),
    },
    {
        path: '/quiz',
        element: (
            <AuthGuard>
                <QuizGame />
            </AuthGuard>
        ),
    },
]);

