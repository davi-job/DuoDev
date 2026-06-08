import { useEffect, useRef } from 'react';

interface Props {
    onVerified: () => void;
}

export function CloudflareCheck({ onVerified }: Props) {
    const turnstileRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const sitekey = import.meta.env.VITE_PUBLIC_KEY as string | undefined;
    const isLocalEnvironment =
        import.meta.env.DEV ||
        ['localhost', '127.0.0.1'].includes(window.location.hostname);

    useEffect(() => {
        if (isLocalEnvironment) {
            (window as any).turnstileToken = 'dev-turnstile-bypass';
            onVerified();
            return;
        }

        if (!sitekey) {
            console.warn('VITE_PUBLIC_KEY ausente. Turnstile não foi inicializado.');
            return;
        }

        let cancelled = false;

        const renderTurnstile = () => {
            const turnstile = (window as any).turnstile;

            if (
                cancelled ||
                !turnstile ||
                !turnstileRef.current ||
                widgetIdRef.current ||
                turnstileRef.current.childElementCount > 0
            ) {
                return;
            }

            widgetIdRef.current = turnstile.render(turnstileRef.current, {
                sitekey,
                callback: (token: string) => {
                    (window as any).turnstileToken = token;
                    onVerified();
                },
                'expired-callback': () => {
                    (window as any).turnstileToken = undefined;
                },
            });
        };

        renderTurnstile();

        const intervalId = window.setInterval(renderTurnstile, 250);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);

            const turnstile = (window as any).turnstile;
            if (turnstile && widgetIdRef.current) {
                turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [isLocalEnvironment, onVerified, sitekey]);

    if (isLocalEnvironment) {
        return <div className="text-center text-xs text-gray-500">Verificacao de seguranca desativada no ambiente local.</div>;
    }

    return <div className="flex justify-center" ref={turnstileRef}></div>;
}
