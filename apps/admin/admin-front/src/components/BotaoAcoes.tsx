import { EllipsisVerticalIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import './BotaoAcoes.css';

function BotaoAcoes() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="actionBtn" ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button onClick={() => setOpen(!open)}>
                <EllipsisVerticalIcon />
            </button>

            {open && (
                <div className="popup">
                    <button onClick={() => console.log('edit')}>Edit</button>
                    <span />
                    <button onClick={() => console.log('delete')}>Delete</button>
                </div>
            )}
        </div>
    );
}

export default BotaoAcoes;
