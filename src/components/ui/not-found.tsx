"use client";

import React from 'react'
import { Button } from './button'
import { useRouter } from 'next/navigation';

const NotFoundInfo = () => {
    const router = useRouter();

    async function onClick() {
        router.push("/login")
    }

    return (
        <div className='w-full min-h-screen flex flex-col items-center justify-center overflow-y-auto'>
            <div className='text-center mb-6 space-y-6'>
                <h1 className='text-4xl font-bold'>404 - Page Not Found</h1>
                <p>This page does not exist.</p>
            </div>
            <Button onClick={onClick}>
                Go to login
            </Button>
        </div >
    )
}

export default NotFoundInfo
