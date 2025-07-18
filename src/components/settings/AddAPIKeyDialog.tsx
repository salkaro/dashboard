'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { LucidePlus } from 'lucide-react'
import { apiTokenAccessLevelsName } from '@/utils/constants'

interface Props {
    disabled?: boolean;
    addToken: (data: { name: string; accessLevel: number }) => Promise<void>;
}

const AddAPIKeyDialog: React.FC<Props> = ({ disabled, addToken }) => {
    const [name, setName] = useState('')
    const [accessLevel, setAccessLevel] = useState<string>('2') // default to “Upload Only”
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit() {
        if (!name.trim()) {
            alert("Name is required")
            return
        }
        try {
            setIsSubmitting(true)
            await addToken({ name: name.trim(), accessLevel: Number(accessLevel) })
        } catch (err) {
            console.error("Failed to add API key:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                    <LucidePlus className="w-4 h-4 mr-2" />
                    Generate New
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New API Key</DialogTitle>
                    <DialogDescription>
                        Enter a name and select an access level for this API key.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="key-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="key-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mobile App Key"
                            className="col-span-3"
                        />
                    </div>

                    {/* Access Level */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="access-level" className="text-right">
                            Access Level
                        </Label>
                        <Select
                            value={accessLevel}
                            onValueChange={setAccessLevel}
                        >
                            <SelectTrigger id="access-level">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(apiTokenAccessLevelsName).map(([level, label]) => (
                                    <SelectItem key={level} value={level}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!name || isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create API Key'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddAPIKeyDialog
