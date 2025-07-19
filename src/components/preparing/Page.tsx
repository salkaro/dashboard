"use client"

import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import LoadingSpinner from '../ui/spinner';

const Page = () => {
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async () => {
            sessionStorage.removeItem('signInToken')
            router.replace('/')
        })
        return unsubscribe
    }, [router])

    useEffect(() => {
        async function trySignIn() {
            const firebaseToken = sessionStorage.getItem('signInToken')

            if (status === 'authenticated' && firebaseToken && !auth.currentUser) {
                try {
                    await signInWithCustomToken(auth, firebaseToken)
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
