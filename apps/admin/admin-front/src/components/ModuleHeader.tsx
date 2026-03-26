import './ModuleHeader.css';

interface HeaderProps {
    path: Array<string>;
    title: string;
    btnLabel: string;
    btnOnClick: () => void;
}

function ModuleHeader({ path, title, btnLabel, btnOnClick }: HeaderProps) {
    return (
        <header>
            <div className="title">
                <h4>
                    {path.map((item, index) => (
                        <>
                            {index > 0 && (
                                <span key={-index} className="title_divider">
                                    /
                                </span>
                            )}
                            <span key={index}>{item}</span>
                        </>
                    ))}
                </h4>
                <h2>{title}</h2>
            </div>
            <button onClick={btnOnClick}>{btnLabel}</button>
        </header>
    );
}

export default ModuleHeader;
