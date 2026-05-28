import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import CampoFormulario from '../components/CampoFormulario';
import './login.css';

export const Route = createFileRoute('/login')({
    beforeLoad: () => {
        const token = localStorage.getItem('admin_token');
        if (token) throw redirect({ to: '/' });
    },
    component: LoginPage,
});

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const data = await apiLogin(email, password);
            login(data.access_token, data.user);
            navigate({ to: '/' });
        } catch {
            setErro('E-mail ou senha inválidos.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-mark">D</div>
                    <span className="login-logo-text">
                        Duo<span>Dev</span>
                    </span>
                </div>

                <h1 className="login-heading">Acessar painel</h1>
                <p className="login-subheading">Entre com sua conta de administrador.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {erro && <p className="login-error">{erro}</p>}

                    <CampoFormulario label="E-mail">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@exemplo.com"
                            required
                            autoFocus
                        />
                    </CampoFormulario>

                    <CampoFormulario label="Senha">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </CampoFormulario>

                    <button className="login-btn" type="submit" disabled={carregando}>
                        {carregando ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
