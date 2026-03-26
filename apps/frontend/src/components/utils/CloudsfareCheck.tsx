import { useEffect, useRef } from "react";

export function CloudflareCheck() {

    const turnstileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
       if ((window as any).turnstile && turnstileRef.current && turnstileRef.current.childElementCount === 0) {
           (window as any).turnstile.render(turnstileRef.current, {
               sitekey: import.meta.env.VITE_PUBLIC_KEY,
               callback: (token: string) => {
                   (window as any).turnstileToken = token;
               },
           });
       }
   }, []);

    return <div className="flex justify-center" ref={turnstileRef}></div>;
}