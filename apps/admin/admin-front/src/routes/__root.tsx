import { createRootRoute, Outlet } from '@tanstack/react-router';

import Sidebar from '../components/Sidebar';
import { ToastProvider } from '../components/Toast';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <ToastProvider>
            <Sidebar />
            <main>
                <Outlet />
            </main>
        </ToastProvider>
    );
}
