'use client'

import React, { useMemo } from "react"
import { SidebarTrigger } from "./sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { ModeToggle } from "../theme-toggle"
import OrganisationSearch from "./organisation-search"

function formatSegment(segment: string) {
    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SiteHeader({ title }: { title: string }) {
    const segments = useMemo(() => {
        const cleaned = title.replace(/^\/+|\/+$/g, "");
        return cleaned ? cleaned.split("/") : [];
    }, [title]);

    const breadcrumbTrail = useMemo(() => {
        let href = "";
        return segments.map((segment, index) => {
            href += `/${segment.toLocaleLowerCase()}`;
            const isLast = index === segments.length - 1;

            return isLast ? (
                <BreadcrumbItem key={href}>
                    <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                </BreadcrumbItem>
            ) : (
                <React.Fragment key={href}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={href}>{formatSegment(segment)}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </React.Fragment>
            );
        });
    }, [segments]);

    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbTrail}
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto flex justify-center items-center gap-4">
                    <OrganisationSearch />
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
