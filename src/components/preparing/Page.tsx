"use client"

// Local Imports
import { auth } from '@/lib/firebase/config';
import LoadingSpinner from '../ui/spinner';

// External Imports
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
    const router = useRouter();
    const { status } = useSession();

    function getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async () => {
            if (auth.currentUser) {
                const isProd = process.env.NODE_ENV === "production";
                const domain = isProd ? "; domain=.salkaro.com" : "";
                const secure = isProd ? "; secure" : "";

                document.cookie = `signInToken=; path=/${domain}; max-age=0${secure}; samesite=Lax`;

                router.push("/")
            }
        })
        return unsubscribe
    }, [router])

    useEffect(() => {
        async function trySignIn() {
            const firebaseToken = getCookie('signInToken');
            console.log("COOKIE", firebaseToken)

            if (status === 'authenticated' && firebaseToken && !auth.currentUser) {
                try {
                    await signInWithCustomToken(auth, firebaseToken);
                } catch (err) {
                    console.error('Firebase sign-in failed', err)
                }
            }
        }

        trySignIn()
    }, [status])

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-18 h-18 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <LoadingSpinner />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                We are preparing your account
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Please do not exit or refresh this page, you will be redirected when logged in.
            </p>
        </div>
    )
}

export default Page
