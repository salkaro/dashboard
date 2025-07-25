// components/HashTabs.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import Overview from './Overview';
import Organisation from './Organisation';
import Billing from './Billing';
import Authentication from './Authentication';
import { levelThreeAccess, levelTwoAccess } from '@/utils/constants';
import { useSession } from 'next-auth/react';

export default function HashTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [value, setValue] = useState<string>('overview');
    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);
    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);


    const updateHash = useCallback(
        (tabValue: string) => {
            setValue(tabValue);
            const newUrl = `${pathname}#${tabValue}`;
            router.replace(newUrl, { scroll: false });
        },
        [pathname, router]
    );

    const tabs = useMemo(() => {
        const base = [
            { value: "overview", label: "Overview" },
            { value: "organisation", label: "Organisation" },
        ];
        if (hasLevelThreeAccess) {
            base.push(
                { value: "billing", label: "Billing" },
            );
        }
        if (hasLevelTwoAccess) {
            base.push(
                { value: "authentication", label: "Authentication" }
            )
        }
        return base;
    }, [hasLevelTwoAccess, hasLevelThreeAccess]);


    // Update active tab based on URL hash on mount or hash change
    useEffect(() => {
        const syncFromHash = () => {
            const hash = window.location.hash.slice(1);
            if (tabs.some(t => t.value === hash)) {
                setValue(hash);
            } else {
                updateHash("overview");
            }
        };

        // Initial load
        syncFromHash();

        // Listen for future changes (e.g., clicking external links or browser back)
        window.addEventListener("hashchange", syncFromHash);

        return () => {
            window.removeEventListener("hashchange", syncFromHash);
        };
    }, [updateHash, tabs]);



    return (
        <Tabs value={value} onValueChange={updateHash}>
            <TabsList>
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="p-4">
                    {{
                        overview: <Overview />,
                        organisation: <Organisation />,
                        billing: <Billing />,
                        authentication: <Authentication />,
                    }[tab.value]}
                </TabsContent>
            ))}
        </Tabs>
    );
}
