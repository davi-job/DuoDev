import { Outlet } from 'react-router';

export function AuthLayout() {
    return (
        <div className="grid min-h-screen grid-cols-2 antialiased">
            <div className="border-foreground/5 bg-muted text-muted-foreground flex h-full flex-col justify-between border-r p-10">
                <div className="flex items-center gap-3 text-lg font-medium">
                    
                </div>

                <div>
                    <h2 className="text-center text-xl mb-3">
                        Os melhores temas para <span className="font-bold text-rose-400">presentear</span> alguém
                    </h2>

                    <div className="max-w-lg mx-auto">
                        
                    </div>
                </div>

                <footer className="text-sm">
                    A melhor forma de presentear alguém &copy; <span className="font-bold text-rose-400">lovezao</span>{' '}
                    - {new Date().getFullYear()}
                </footer>
            </div>

            <div className="relative flex flex-col items-center justify-center">
                <Outlet />
            </div>
        </div>
    );
}
