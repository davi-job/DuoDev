import { useEffect, useRef } from "react";

interface Props {
    onVerified: () => void;
}

export function CloudflareCheck({ onVerified }: Props) {
    const turnstileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if ((window as any).turnstile && turnstileRef.current && turnstileRef.current.childElementCount === 0) {
            (window as any).turnstile.render(turnstileRef.current, {
                sitekey: import.meta.env.VITE_PUBLIC_KEY,
                callback: (token: string) => {
                    (window as any).turnstileToken = token;
                    onVerified(); 
                },
            });
        }
    }, []);

    return <div className="flex justify-center" ref={turnstileRef}></div>;
}
