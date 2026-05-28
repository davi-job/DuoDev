import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';

import Sidebar from '../components/Sidebar';
import { ToastProvider } from '../components/Toast';
import { AuthProvider } from '../auth/AuthContext';

export const Route = createRootRoute({
    beforeLoad: ({ location }) => {
        if (location.pathname === '/login') return;
        const token = localStorage.getItem('admin_token');
        if (!token) throw redirect({ to: '/login' });
    },
    component: RootLayout,
});

function RootLayout() {
    const { location } = useRouterState();
    const isLoginPage = location.pathname === '/login';

    return (
        <AuthProvider>
            <ToastProvider>
                {!isLoginPage && <Sidebar />}
                <main>
                    <Outlet />
                </main>
            </ToastProvider>
        </AuthProvider>
    );
}
