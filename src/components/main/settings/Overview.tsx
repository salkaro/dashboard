"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { IUser } from "@/models/user"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { updateUser } from "@/services/firebase/update"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import DeleteUserDialog from "./dialogs/DeleteUserDialog"
import { Separator } from "../../ui/separator"


const Overview = () => {
    const { data: session } = useSession();
    const [user, setUser] = useState<IUser>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUser(session?.user as IUser);
    }, [session])

    const handleChange = (key: keyof IUser, value: unknown) => {
        setUser((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setLoading(true);
        const { error } = await updateUser({ user: user as IUser });

        if (error) {
            toast.error("Failed to update user", {
                description: error,
            });
        } else {
            toast.success("Profile updated successfully");
        }

        setLoading(false);
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Personal</h3>
                <p className="text-muted-foreground text-sm">Your personal information</p>
            </div>

            <Card>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>First Name</Label>
                        <Input
                            value={user?.firstname || ""}
                            onChange={(e) => handleChange("firstname", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Last Name</Label>
                        <Input
                            value={user?.lastname || ""}
                            onChange={(e) => handleChange("lastname", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={user?.email || ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2Icon className="animate-spin" />}
                        {loading ? "Updating" : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
            <div className="text-muted-foreground text-sm w-full flex justify-end pr-4">
                Joined {user?.metadata?.createdAt
                    ? formatDistanceToNow(user?.metadata.createdAt, { addSuffix: true })
                    : "N/A"}
            </div>

            <div>
                <h3 className="text-lg font-medium">Danger zone</h3>
                <p className="text-muted-foreground text-sm">Irreversible and destructive actions</p>
            </div>
            <Card>
                <CardContent>
                    <h1 className="text-lg font-medium mb-2">Delete user</h1>
                    <Separator />
                    <p className="my-6 text-muted-foreground">Once your account is deleted, it cannot be recovered. Please make sure you&apos;re absolutely certain.</p>
                    <DeleteUserDialog />
                </CardContent>
            </Card>
        </div>
    )
}

export default Overview
