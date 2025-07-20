import { Store } from 'lucide-react';
import { useRouter } from 'next/navigation'
import React from 'react'
import { Button } from './button';

const CreateOrganisationButton = () => {
    const router = useRouter();

    function handleClick() {
        router.push("/settings#organisation")
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-18 h-18 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Store className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No organisation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Please go to settings to create a new organisation
            </p>

            <Button onClick={handleClick} className='mt-6'>
                Settings
            </Button>
        </div>
    )
}

export default CreateOrganisationButton
