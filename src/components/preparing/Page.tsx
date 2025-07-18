"use client"

import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react'
import LoadingSpinner from '../ui/spinner';

const Page = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Kick off a poll on mount
        const poll = async () => {
            try {
                // Refresh NextAuth session cookie
                await getSession();
            } catch (e) {
                console.debug("Session refresh failed:", e);
            }

            // If we now have a firebaseToken and aren't signed in, try sign‑in
            if (session?.firebaseToken && !auth.currentUser) {
                try {
                    await signInWithCustomToken(auth, session.firebaseToken);
                    router.push("/")

                    // Clear interval once signed in
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                } catch (err) {
                    console.debug("Re-auth attempt failed, will retry in 1s", err);
                }
            } else if (auth.currentUser) {
                router.push("/")
            }
        };

        // Start immediate poll + interval
        poll();
        intervalRef.current = setInterval(poll, 1000);

        // Also clear if Firebase reports a user
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        });

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            unsubscribe();
        };
    }, [session?.firebaseToken, status, router]);

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
