"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { useOrganisation } from '@/hooks/useOrganisation'
import { Loader2Icon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { IOrganisation } from '@/models/organisation'
import { Label } from '../ui/label'
import AddMemberDialog from './dialogs/AddMemberDialog'
import { updateOrganisation } from '@/services/firebase/update'
import { useSession } from 'next-auth/react'
import { levelThreeAccess } from '@/utils/constants'
import MembersTable from './MembersTable'
import CreateOrganisation from './CreateOrganisation';
import { IUser } from '@/models/user';


const Organisation = () => {
    // Hooks
    const { data: session } = useSession();
    const { organisation, refetch } = useOrganisation();

    // States
    const [updateOrg, setUpdateOrg] = useState<IOrganisation>();
    const [loading, setLoading] = useState(false);

    const hasLevelThreeAccess = levelThreeAccess.includes(session?.user.organisation?.role as string);

    useEffect(() => {
        if (organisation) {
            setUpdateOrg(organisation);
        }
    }, [organisation])

    const handleChange = (key: keyof IOrganisation, value: unknown) => {
        setUpdateOrg((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        if (!hasLevelThreeAccess) return;

        setLoading(true);

        const { error } = await updateOrganisation({ organisation: updateOrg as IOrganisation })

        if (error) {
            toast.error("Failed to update user", {
                description: error,
            });
        } else {
            toast.success("Organisation updated successfully");
        }
        refetch()

        setLoading(false);
    }

    return (
        <div className='space-y-4'>
            <div>
                <h3 className="text-lg font-medium">Organisation</h3>
                <p className="text-muted-foreground text-sm">Your organisation information</p>
            </div>

            {organisation && (
                <>
                    <Card>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={updateOrg?.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    readOnly={!hasLevelThreeAccess}
                                />
                            </div>
                        </CardContent>
                        {hasLevelThreeAccess && (
                            <CardFooter className="justify-end">
                                <Button onClick={handleSave} disabled={loading}>
                                    {loading && <Loader2Icon className="animate-spin" />}
                                    {loading ? "Updating" : "Save Changes"}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                    <div className="text-muted-foreground text-sm w-full flex justify-between px-4">
                        <div>
                            {organisation?.members} active member{(organisation?.members && organisation?.members > 1) ? "s" : ""}
                        </div>
                        <div>
                            Created {updateOrg?.createdAt
                                ? formatDistanceToNow(updateOrg.createdAt, { addSuffix: true })
                                : "N/A"}
                        </div>
                    </div>
                    {hasLevelThreeAccess && (
                        <div className='space-y-4 mt-12'>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium">Members</h3>
                                    <p className="text-muted-foreground text-sm">Your members information</p>
                                </div>
                                {hasLevelThreeAccess && <AddMemberDialog organisation={organisation as IOrganisation} />}
                            </div>
                            <MembersTable organisation={organisation as IOrganisation} />
                        </div>
                    )}
                </>
            )}

            {!organisation && (
                <CreateOrganisation refetch={refetch} user={session?.user as IUser} />
            )}
        </div>
    )
}

export default Organisation
