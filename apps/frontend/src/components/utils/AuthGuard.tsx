import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000; 

      if (decodedToken.exp < currentTime) {        
        localStorage.removeItem('token'); 
        navigate('/login');
      }
    } catch (error) {      
      console.error('Invalid token:', error);
      localStorage.removeItem('token'); // Clear invalid token
      navigate('/login');
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthGuard;
