import { Fragment } from 'react';
import { Link } from '@tanstack/react-router';
import './ModuleHeader.css';

interface PathItem {
    label: string;
    to?: string;
}

interface HeaderProps {
    path: Array<PathItem | string>;
    title: string;
    btnLabel?: string;
    btnOnClick?: () => void;
    btnDisabled?: boolean;
}

function ModuleHeader({ path, title, btnLabel, btnOnClick, btnDisabled }: HeaderProps) {
    const items = path.map((item) =>
        typeof item === 'string' ? { label: item } : item,
    );

    return (
        <header className="modulo-header">
            <div className="title">
                <h4>
                    {items.map((item, index) => (
                        <Fragment key={index}>
                            {index > 0 && <span className="title_divider">/</span>}
                            {item.to ? (
                                <Link to={item.to} className="breadcrumb-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span>{item.label}</span>
                            )}
                        </Fragment>
                    ))}
                </h4>
                <h2>{title}</h2>
            </div>

            {btnLabel && (
                <button onClick={btnOnClick} disabled={btnDisabled}>
                    {btnLabel}
                </button>
            )}
        </header>
    );
}

export default ModuleHeader;
