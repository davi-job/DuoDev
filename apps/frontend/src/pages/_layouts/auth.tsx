import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function AuthLayout() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    
    const greenDivX = isMobile ? '0%' : isLoginPage ? '0%' : '100%';
    const formDivX = isMobile ? '0%' : isLoginPage ? '0%' : '-100%';

    return (
        <div className="relative min-h-screen overflow-hidden">
            <motion.div
                className={[
                    'relative w-full h-48 bg-[#9EEA6C] flex items-center justify-center z-20',
                    'md:absolute md:top-0 md:left-0 md:w-1/2 md:h-full',
                ].join(' ')}
                animate={{ x: greenDivX }}
                transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                }}
            >
                <h2 className="text-4xl font-bold text-white">duodev</h2>
            </motion.div>

            <motion.div
                className={[
                    'relative w-full max-w-full flex-1 flex items-center justify-center z-10 px-0',
                    'md:absolute md:top-0 md:left-1/2 md:w-1/2 md:h-full md:py-0 md:px-0',
                ].join(' ')}
                animate={{ x: formDivX }}
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
