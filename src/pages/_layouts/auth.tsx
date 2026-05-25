import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthLayout() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Painel verde */}
            <motion.div
                className="absolute top-0 left-0 w-1/2 h-full bg-[#9EEA6C] flex items-center justify-center z-20"
                animate={{
                    x: isLoginPage ? '0%' : '100%',
                }}
                transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                }}
            >
                <h2 className="text-4xl font-bold text-white">duodev</h2>
            </motion.div>

            {/* Formulário */}
            <motion.div
                className="absolute top-0 left-1/2 w-1/2 h-full flex items-center justify-center z-10"
                animate={{
                    x: isLoginPage ? '0%' : '-100%',
                }}
                transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
