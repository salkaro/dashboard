"use client"

import React, { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
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
    const { status } = useSession();

    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async () => {
            if (auth.currentUser) {
                const path = window.location.pathname;

                if (path == "/preparing") {
                    router.push("/sensors")
                }
            }
        })
        return unsubscribe
    }, [router])


    useEffect(() => {
        if (status === "unauthenticated") {
            setShowDialog(true);
        }
    }, [status])

    const handleReLogin = async () => {
        await signOut("/login");
        router.push("/login")
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