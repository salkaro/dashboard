"use client";

// Local Imports
import { useOrganisation } from '@/hooks/useOrganisation';

// External Imports
import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes';
import { createCustomerSession } from '@/services/stripe/create';

const StripePricingTable = () => {
    const { theme } = useTheme();
    const { organisation } = useOrganisation();
    const [clientSecret, setClientSecret] = useState<string>();

    useEffect(() => {
        async function createSession() {
            if (!clientSecret && organisation?.stripeCustomerId) {
                const secret = await createCustomerSession({ customerId: organisation.stripeCustomerId });
                setClientSecret(secret as string)
            }
        }
        createSession()
    })

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
        "pricing-table-id": theme === "dark" ? process.env.NEXT_PUBLIC_DARK_PRICING_TABLE_ID : process.env.NEXT_PUBLIC_LIGHT_PRICING_TABLE_ID,
        "publishable-key": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        "customer-session-client-secret": clientSecret,
    })

}

export default StripePricingTable
