"use client";

// Local Imports
import { IUser } from '@/models/user';

// External Imports
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

const StripePricingTable = () => {
    const { theme } = useTheme();
    const { data: session } = useSession();

    const user = session?.user as IUser;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return React.createElement("stripe-pricing-table", {
        "pricing-table-id": theme === "dark" ? "prctbl_1RlEyTJtdRMvYIcKNKgxzTUg" : "prctbl_1RlEzqJtdRMvYIcKFgu8oyin",
        "publishable-key": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        "customer-email": user?.email
    })

}

export default StripePricingTable
