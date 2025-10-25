"use client";

import React from 'react'
import StripePricingTable from '../../ui/pricing-table'
import { Button } from '../../ui/button'
import { createBillingPortalUrl } from '@/services/stripe/create';
import { useOrganisation } from '@/hooks/useOrganisation';
import { toast } from 'sonner';

const Billing = () => {
    const { organisation } = useOrganisation();

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
        <div className='space-y-4'>
            <div className='w-full flex justify-between items-center'>
                <h3 className="text-lg font-medium">Billing</h3>
                <Button onClick={handleBillingPortal}>
                    Manage
                </Button>
            </div>
            <StripePricingTable />
            <div className='mt-24'>
                <p className='text-muted-foreground text-sm'>If you need more, we do have available plans, please contact us at <span className='font-bold text-accent-foreground'>contact@salkaro.com</span></p>
            </div>
        </div>
    )
}

export default Billing
