"use client"

import React, { useEffect, useState } from "react"
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Separator } from "./ui/separator"
import { ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { signOut } from "@/services/sign-out"

interface Props {
    children: React.ReactNode;
}

const FirebaseProvider: React.FC<Props> = ({ children }) => {
    const { status } = useSession();
    const [showDialog, setShowDialog] = useState(false)
    const router = useRouter();

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

                const path = window.location.pathname;

                if (path == "/preparing") {
                    router.push("/")
                }
            }
        })
        return unsubscribe
    }, [router])

    useEffect(() => {
        async function trySignIn() {
            const firebaseToken = getCookie('signInToken');

            if (status === 'authenticated' && firebaseToken && !auth.currentUser) {
                try {
                    await signInWithCustomToken(auth, firebaseToken);
                } catch (err) {
                    setShowDialog(true)
                    console.error('Firebase sign-in failed', err)
                }
            }

            if (status !== 'loading' && !firebaseToken && !auth.currentUser) {
                setShowDialog(true);
            } else {
                setShowDialog(false);
            }
        }

        trySignIn()
    }, [status])

    const handleReLogin = async () => {
        await signOut();
        router.push("https://auth.salkaro.com/login")
    }


    if (showDialog) {
        return (
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Session Expired</DialogTitle>
                        <Separator />
                    </DialogHeader>
                    <p className="text-muted-foreground">Your session has expired or you’ve been logged out. Please log back in to continue.</p>
                    <div className="flex justify-center items-center mt-4">
                        <Button onClick={handleReLogin}>
                            Go to login
                            <ArrowRight />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return <>{children}</>
}

export default FirebaseProvider
