import { Inbox } from 'lucide-react';
import React from 'react'

interface Props {
    text?: string
}
const NoContent: React.FC<Props> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-18 h-18 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {text}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                There&apos;s nothing to display here at the moment. Check back later or try refreshing the page.
            </p>
        </div>
    )
}

export default NoContent;
