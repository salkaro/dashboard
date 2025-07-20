"use client";

import FirebaseProvider from "@/components/firebase-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                disableTransitionOnChange
            >
                <FirebaseProvider>
                    {children}
                </FirebaseProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}