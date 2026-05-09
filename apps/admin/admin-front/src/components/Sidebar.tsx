import { HomeIcon, LayersIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
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
    return (
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
        </aside>
    );
}

export default Sidebar;
