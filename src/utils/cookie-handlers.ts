import { auth } from "@/lib/firebase/config";

export function getCookie(name: string): string | null {
    const uid = auth.currentUser?.uid as string;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; salkaro.${uid}.${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

export function setCookie(name: string, value: string, options: { expires?: number; path?: string } = {}): void {
    const uid = auth.currentUser?.uid as string;
    let cookie = `salkaro.${uid}.${name}=${value}; path=${options.path || '/'};`;

    if (options.expires) {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookie += ` expires=${date.toUTCString()};`;
    }

    document.cookie = cookie;
}

export function removeCookie(name: string): void {
    const uid = auth.currentUser?.uid as string;
    if (!uid) return;

    document.cookie = `salkaro.${uid}.${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

export function removeAllCookies(): void {
    const cookies = document.cookie.split(";");

    cookies.forEach(cookie => {
        const trimmed = cookie.trim();
        if (trimmed.startsWith("salkaro.")) {
            const cookieName = trimmed.split("=")[0];
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        }
    });
}