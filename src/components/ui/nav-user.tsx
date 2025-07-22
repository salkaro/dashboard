"use client"

import {
    ChevronsUpDown,
    CreditCard,
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

import { useSession } from "next-auth/react"

import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { createBillingPortalUrl } from "@/services/stripe/create";
import { useOrganisation } from "@/hooks/useOrganisation";
import { toast } from "sonner";
import { levelThreeAccess } from "@/utils/constants";
import { signOut } from "@/services/sign-out";

export function NavUser() {
    const { isMobile } = useSidebar()
    const { data: session } = useSession();
    const { organisation } = useOrganisation();
    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);

    async function handleSignOut() {
        await signOut()
    };

    async function handleBillingPortal() {
        try {
            if (organisation?.stripeCustomerId) {
                const billingUrl = await createBillingPortalUrl({ customerId: organisation?.stripeCustomerId });
                if (billingUrl) {
                    window.open(billingUrl, "_blank");
                } else {
                    throw new Error("Failed to create billing portal url")
                }
            } else {
                throw new Error("Organisation is invalid")
            }
        } catch (error) {
            toast("Failed to create billing portal url", { description: `${error}` })
        }
    }


    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {/**  <AvatarImage src="/avatar/FlippifyGradientBG.svg" alt={session?.user.firstname as string} />*/}
                                <AvatarFallback className="rounded-lg">{`${session?.user.firstname?.slice(0, 1)}${session?.user.lastname?.slice(0, 1)}`}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{session?.user.firstname}</span>
                                <span className="truncate text-xs">{session?.user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {/**  <AvatarImage src="/avatar/FlippifyGradientBG.svg" alt={session?.user.firstname ?? "Name"} />*/}
                                    <AvatarFallback className="rounded-lg">{`${session?.user.firstname?.slice(0, 1)}${session?.user.lastname?.slice(0, 1)}`}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{session?.user.firstname ?? "Name"}</span>
                                    <span className="truncate text-xs">{session?.user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        {hasLevelThreeAccess && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={handleBillingPortal}>
                                        <CreditCard />
                                        Billing
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
