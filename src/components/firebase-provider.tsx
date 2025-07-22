"use client"

import React, { useEffect, useState } from "react"
import { browserLocalPersistence, onAuthStateChanged, onIdTokenChanged, setPersistence, signInWithCustomToken } from "firebase/auth"
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
    const router = useRouter();
    const { data: session, status } = useSession();

    const [showDialog, setShowDialog] = useState(false);
    const [firebaseInitialized, setFirebaseInitialized] = useState(false);

    console.log(auth)
    console.log(session)


    function getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    // Set persistence once
    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .catch(err => console.error("Failed to set persistence:", err))
    }, [])


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async () => {
            setFirebaseInitialized(true);

            if (auth.currentUser) {
                const isProd = process.env.NODE_ENV === "production";
                const domain = isProd ? "; domain=.salkaro.com" : "";
                const secure = isProd ? "; secure" : "";

                document.cookie = `signInToken=; path=/${domain}; max-age=0${secure}; samesite=Lax`;

                const path = window.location.pathname;

                if (path == "/preparing") {
                    router.push("/sensors")
                }
            }
        })
        return unsubscribe
    }, [router])

    // inside your FirebaseProvider component
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken(); // ensures it's fresh
                document.cookie = `signInToken=${token}; path=/; samesite=Lax;` + (process.env.NODE_ENV === "production" ? "; domain=.salkaro.com; secure" : "");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function trySignIn() {
            if (!firebaseInitialized) return;

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
    }, [status, firebaseInitialized])

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
