'use client'

import React from 'react'
import { levelTwoAccess } from '@/utils/constants'
import { useSession } from 'next-auth/react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import Alert from '@/components/ui/alert'


interface Props {
    sensorId: string;
    deleteSensor: (id: string) => void;
}
const DeleteSensorDialog: React.FC<Props> = ({ sensorId, deleteSensor }) => {
    const { data: session } = useSession();

    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);


    function handleDelete() {
        if (hasLevelTwoAccess) {
            deleteSensor(sensorId)
        }
    }

    return (
        <Alert
            triggerComponent={
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
            }
            onClick={() => handleDelete()}
            title="Are you sure?"
            description="This will permanently remove the sensor and any associated data."
        />

    )
}

export default DeleteSensorDialog
