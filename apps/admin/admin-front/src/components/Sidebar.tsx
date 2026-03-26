import { HomeIcon, LayoutTemplateIcon, ListCheckIcon, LogsIcon, TrainTrackIcon } from 'lucide-react';
import './Sidebar.css';
import { Link } from '@tanstack/react-router';

const modules = [
    {
        title: 'Home',
        icon: <HomeIcon size={16} />,
        path: '/',
    },
    {
        title: 'Categorias',
        icon: <LogsIcon size={16} />,
        path: 'categorias',
    },
    {
        title: 'Trilhas',
        icon: <TrainTrackIcon size={16} />,
        path: 'trilhas',
    },
    {
        title: 'Aulas e Questões',
        icon: <ListCheckIcon size={16} />,
        path: 'aulas&questoes',
    },
    {
        title: 'Website',
        icon: <LayoutTemplateIcon size={16} />,
        path: 'website',
    },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <section className="sidebar_header">
                {/* <img src="" alt="DuoDev Logo" height={'30px'} width={'30px'} /> */}
                <div className="sidebar_header_text">
                    <h3>DuoDev</h3>
                    <h4>PAINEL ADMINISTRATIVO</h4>
                </div>
            </section>
            <section className="sidebar_nav">
                <h4>MÓDULOS</h4>
                <nav>
                    {modules.map((module) => {
                        return (
                            <Link className="nav_link" to={`/${module.path}/`} activeProps={{ className: 'selected' }}>
                                {module.icon}
                                <span>{module.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </section>
        </aside>
    );
}

export default Sidebar;
