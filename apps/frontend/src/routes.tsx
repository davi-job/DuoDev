
import { createBrowserRouter, Navigate } from 'react-router';
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
import MeusConteudos from './pages/apps/MeusConteudos';
import Configuracoes from './pages/apps/Configuracoes';
import Categorias from './pages/apps/Categorias';
import Trail from './pages/apps/Trail';
import LessonPage from './pages/apps/LessonPage';
import ChallengePage from './pages/apps/ChallengePage';
import QuizGame from './pages/apps/QuizGame';
import Ranking from './pages/apps/Ranking';
import { ForgetMyPassword } from './pages/auth/forget-my-password';
import { VerifyCodeResetPassword } from './pages/auth/verify-code-reset-password';
import { ResetPassword } from './pages/auth/reset-password';


export const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />,
            },
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
            {
                path: '/esqueci-minha-senha',
                element: <ForgetMyPassword />,
            },
            {
                path: '/verificar-codigo-redefinicao',
                element: <VerifyCodeResetPassword />,
            },
            {
                path: '/redefinir-senha',
                element: <ResetPassword />,
            }
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
        path: '/ranking',
        element: (
            <AuthGuard>
                <Ranking />
            </AuthGuard>
        ),
    },
    {
        path: '/trilhas',
        element: (
            <AuthGuard>
                <Categorias />
            </AuthGuard>
        ),
    },
    {
        path: '/categorias',
        element: <Navigate to="/trilhas" replace />,
    },
    {
        path: '/meus-conteudos',
        element: (
            <AuthGuard>
                <MeusConteudos />
            </AuthGuard>
        ),
    },
    {
        path: '/conheca-o-projeto',
        element: <Navigate to="/home" replace />,
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
        path: '/trilha/:trailId',
        element: (
            <AuthGuard>
                <Trail />
            </AuthGuard>
        ),
    },
    {
        path: '/trilha/:trailId/aula/:lessonId',
        element: (
            <AuthGuard>
                <LessonPage />
            </AuthGuard>
        ),
    },
    {
        path: '/trilha/:trailId/desafio/:challengeId',
        element: (
            <AuthGuard>
                <ChallengePage />
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
        path: '/trilha/:trailId/quiz',
        element: (
            <AuthGuard>
                <QuizGame />
            </AuthGuard>
        ),
    },
    {
        path: '*',
        element: <Navigate to="/home" replace />,
    },
]);
