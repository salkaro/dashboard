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
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucidePlus } from 'lucide-react'
import { ISensorMeta } from '@/models/sensor'
import { toast } from 'sonner'
import { Separator } from '../../ui/separator'


interface Props {
    addSensor: (sensor: ISensorMeta) => Promise<void>;
    hitLimit: boolean;
}
const AddSensorDialog: React.FC<Props> = ({ addSensor, hitLimit }) => {
    const emptySensor = {
        name: '',
        model: '',
        location: '',
        units: ''
    }
    const [open, setOpen] = useState(false);
    const [sensor, setSensor] = useState<Omit<ISensorMeta, "id" | "createdAt" | "orgId">>(emptySensor);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(key: keyof typeof sensor, value: string) {
        setSensor(prev => ({ ...prev, [key]: value }));
    }

    async function handleSubmit() {
        if (!sensor.name || !sensor.units) {
            toast("Invalid fields", { description: "Name and Units are required" });
            return;
        }

        if (hitLimit) {
            displayLimitToast();
            return
        }

        try {
            setIsSubmitting(true);
            await addSensor(sensor);
        } catch (err) {
            console.error("Failed to add sensor:", err);
        } finally {
            setIsSubmitting(false);
            setOpen(false);
            setSensor(emptySensor)
        }
    }

    function displayLimitToast() {
        toast("You’ve reached your sensor limit", {
            description: "To add more sensors, please upgrade your plan or remove existing ones."
        });
    }

    if (hitLimit) {
        return (
            <Button onClick={displayLimitToast}>
                <LucidePlus className="w-4 h-4 mr-2" />
                Create New
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                    <LucidePlus className="w-4 h-4 mr-2" />
                    Create New
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='mb-2'>Add New Sensor</DialogTitle>
                    <Separator />
                    <DialogDescription>
                        Fill out the form to register a new sensor in your organisation.
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
    )
}

export default AddSensorDialog
