import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            navigate('/login');
            return;
        }

        const validateWithBackend = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    // Token inválido, expirado ou usuário não existe mais
                    localStorage.removeItem('access_token');
                    navigate('/login');
                    return;
                }

                setChecking(false);
            } catch {
                // Falha de rede — decide se bloqueia ou deixa passar
                localStorage.removeItem('access_token');
                navigate('/login');
            }
        };

        validateWithBackend();
    }, [navigate]);

    if (checking) return null; // ou um spinner

    return <>{children}</>;
};

export default AuthGuard;
