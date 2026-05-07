import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router'; // Import useLocation
import { fetchMeuPerfil } from '../../lib/api'; // Import fetchMeuPerfil

interface AuthGuardProps {
    children: React.ReactNode;
}

const onboardingPaths = ['/selecionar-linguagem', '/formulario-interesse', '/pagina-sucesso'];

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get current location
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            navigate('/login');
            return;
        }

        const validateAndCheckOnboarding = async () => {
            try {
                const user = await fetchMeuPerfil(); // Fetch user profile

                if (!user) {
                    // Token inválido, expirado ou usuário não existe mais
                    localStorage.removeItem('access_token');
                    navigate('/login');
                    return;
                }

                // Check onboarding status
                if (!user.onboardingCompleted && !onboardingPaths.includes(location.pathname)) {
                    navigate('/selecionar-linguagem');
                    return;
                }

                setChecking(false);
            } catch (error) {
                console.error('Authentication or onboarding check failed:', error);
                localStorage.removeItem('access_token');
                navigate('/login');
            }
        };

        validateAndCheckOnboarding();
    }, [navigate, location.pathname]); // Add location.pathname to dependencies

    if (checking) return null; // ou um spinner

    return <>{children}</>;
};

export default AuthGuard;
