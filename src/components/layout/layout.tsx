"use client"

// Local Imports
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// External Imports
import { usePathname } from "next/navigation";
import FirebaseProvider from "../firebase-provider";

export default function Layout({ className, children }: { className?: string, children: React.ReactNode }) {
    const pathname = usePathname();
    const title = pathname === "/" ? "Dashboard" : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2);

    return (
        <FirebaseProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader title={title} />

                    <main className={`w-full p-4 ${className}`} >{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </FirebaseProvider>
    )
}
