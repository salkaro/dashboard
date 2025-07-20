'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ISensorMeta } from '@/models/sensor'
import { DropdownMenuItem } from '../ui/dropdown-menu'
import { Separator } from '../ui/separator'


interface Props {
    fillSensor: ISensorMeta;
    editSensor: (sensor: ISensorMeta) => Promise<void>;
}
const EditSensorDialog: React.FC<Props> = ({ fillSensor, editSensor }) => {
    const [open, setOpen] = useState(false);
    const [sensor, setSensor] = useState<ISensorMeta>(fillSensor);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(key: keyof typeof sensor, value: string) {
        setSensor(prev => ({ ...prev, [key]: value }));
    }

    async function handleSubmit() {
        if (!sensor.name || !sensor.units) {
            alert("Name and Units are required");
            return;
        }

        try {
            setIsSubmitting(true);
            await editSensor(sensor);
        } catch (err) {
            console.error("Failed to edit sensor:", err);
        } finally {
            setIsSubmitting(false);
            setOpen(false);
        }
    }

    return (
        <>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div
                    className="w-full cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    Edit
                </div>
            </DropdownMenuItem>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='mb-2'>Edit Sensor</DialogTitle>
                        <Separator />
                        <DialogDescription>
                            Fill out the form to edit sensor in your organisation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={sensor.name ?? ''}
                                onChange={e => handleChange("name", e.target.value)}
                                placeholder="e.g. Water Pressure Sensor"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="model" className="text-right">
                                Model
                            </Label>
                            <Input
                                id="model"
                                value={sensor.model ?? ''}
                                onChange={e => handleChange("model", e.target.value)}
                                placeholder="e.g. TDP-300"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="location" className="text-right">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={sensor.location ?? ''}
                                onChange={e => handleChange("location", e.target.value)}
                                placeholder="e.g. Boiler Room A"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="units" className="text-right">
                                Units
                            </Label>
                            <Input
                                id="units"
                                value={sensor.units ?? ''}
                                onChange={e => handleChange("units", e.target.value)}
                                placeholder="e.g. PSI"
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Sensor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EditSensorDialog
