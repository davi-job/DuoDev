import { useState } from 'react';
import { HomeIcon, LayersIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import PainelConfiguracoes from './PainelConfiguracoes';
import './Sidebar.css';

const modules = [
    {
        title: 'Home',
        icon: <HomeIcon size={16} />,
        path: '/',
    },
    {
        title: 'Conteúdo',
        icon: <LayersIcon size={16} />,
        path: '/conteudo',
    },
];

function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [configAberto, setConfigAberto] = useState(false);

    function handleLogout() {
        logout();
        navigate({ to: '/login' });
    }

    return (
        <>
            <aside className="sidebar">
                <section className="sidebar_header">
                    <div className="sidebar_header_text">
                        <h3>DuoDev</h3>
                        <h4>PAINEL ADMINISTRATIVO</h4>
                    </div>
                </section>
                <section className="sidebar_nav">
                    <h4>MÓDULOS</h4>
                    <nav>
                        {modules.map((module) => (
                            <Link
                                key={module.path}
                                className="nav_link"
                                to={module.path}
                                activeProps={{ className: 'selected' }}
                                activeOptions={{ exact: module.path === '/' }}
                            >
                                {module.icon}
                                <span>{module.title}</span>
                            </Link>
                        ))}
                    </nav>
                </section>
                <section className="sidebar_footer">
                    <button className="sidebar_user_btn" onClick={() => setConfigAberto(true)}>
                        <div className="sidebar_user_avatar">
                            {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <span className="sidebar_user">{user?.name ?? 'Admin'}</span>
                        <SettingsIcon size={14} className="sidebar_user_icon" />
                    </button>
                    <button className="sidebar_logout" onClick={handleLogout}>
                        <LogOutIcon size={16} />
                        <span>Sair</span>
                    </button>
                </section>
            </aside>

            <PainelConfiguracoes aberto={configAberto} onFechar={() => setConfigAberto(false)} />
        </>
    );
}

export default Sidebar;
