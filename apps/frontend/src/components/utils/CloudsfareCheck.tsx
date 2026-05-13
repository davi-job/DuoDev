import { useEffect, useRef } from 'react';

interface Props {
    onVerified: () => void;
}

export function CloudflareCheck({ onVerified }: Props) {
    const turnstileRef = useRef<HTMLDivElement | null>(null);
    const sitekey = import.meta.env.VITE_PUBLIC_KEY as string | undefined;

    useEffect(() => {
        if (!sitekey) {
            if (import.meta.env.DEV) {
                (window as any).turnstileToken = 'dev-turnstile-bypass';
                onVerified();
            } else {
                console.warn('VITE_PUBLIC_KEY ausente. Turnstile não foi inicializado.');
            }
            return;
        }

        if ((window as any).turnstile && turnstileRef.current && turnstileRef.current.childElementCount === 0) {
            (window as any).turnstile.render(turnstileRef.current, {
                sitekey,
                callback: (token: string) => {
                    (window as any).turnstileToken = token;
                    onVerified();
                },
            });
        }
    }, [onVerified, sitekey]);

    if (!sitekey && import.meta.env.DEV) {
        return <div className="text-center text-xs text-gray-500">Turnstile desativado no ambiente de desenvolvimento.</div>;
    }

    return <div className="flex justify-center" ref={turnstileRef}></div>;
}
