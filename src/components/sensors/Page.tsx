"use client";

// Local Imports
import { useSensors } from '@/hooks/useSensors'
import LoadingSpinner from '../ui/spinner';
import AddSensorDialog from './AddSensorDialog';
import NoContent from '../ui/no-content';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { IconDotsVertical } from "@tabler/icons-react"
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import EditSensorDialog from './EditSensorDialog';
import { useRouter } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { levelTwoAccess, sensorLimits } from '@/utils/constants';
import { useOrganisation } from '@/hooks/useOrganisation';
import CreateOrganisationButton from '../ui/create-organisation-button';

const Page = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const hasLevelTwoAccess = levelTwoAccess.includes(session?.user.organisation?.role as string);
    const { organisation } = useOrganisation();

    const { sensors, loading, addSensor, editSensor, deleteSensor } = useSensors();
    const [selectedSensors, setSelectedSensors] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const sensorLimit = sensorLimits[organisation?.subscription as keyof typeof sensorLimits] ?? 0;

    const allSelected = (sensors?.length ?? 0) > 0 && selectedSensors.size === (sensors?.length ?? 0);

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedSensors(new Set());
        } else {
            setSelectedSensors(new Set(sensors?.map(s => s.id!).filter(Boolean)));
        }
    }

    function toggleSelectSensor(id: string) {
        setSelectedSensors(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }


    function handleDelete(sensorId: string) {
        if (hasLevelTwoAccess) {
            deleteSensor(sensorId)
        }
    }

    const filteredSensors = sensors?.filter((sensor) => {
        const query = searchTerm.toLowerCase();
        return (
            sensor.id?.toLowerCase().includes(query) ||
            sensor.name?.toLowerCase().includes(query) ||
            sensor.model?.toLowerCase().includes(query) ||
            sensor.location?.toLowerCase().includes(query) ||
            sensor.units?.toLowerCase().includes(query) ||
            sensor.orgId?.toLowerCase().includes(query) ||
            new Date(sensor.createdAt as number)?.toDateString().toLowerCase().includes(query)
        );
    });

    function handleSensorLinkClick(sensorId: string) {
        router.push(`/sensors/${sensorId}`)
    }


    if (!loading && !organisation) {
        return <CreateOrganisationButton />
    }

    return (
        <div className='space-y-4'>
            <div className="relative flex justify-between items-center">
                <SearchIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2"
                />
                <Input
                    placeholder="Search sensors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-sm pl-10 pr-20 rounded-full h-9"
                />
                {hasLevelTwoAccess && <AddSensorDialog addSensor={addSensor} hitLimit={(sensors?.length ?? 0) >= sensorLimit} />}
            </div>

            {loading && (
                <div className='w-full flex justify-center items-center min-h-48'>
                    <LoadingSpinner />
                </div>
            )}

            {(!loading && filteredSensors && filteredSensors.length === 0) && (
                <NoContent text="No sensors match your search" />
            )}

            {(!loading && filteredSensors && filteredSensors.length > 0) && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {hasLevelTwoAccess && (
                                <TableHead>
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all sensors"
                                    />
                                </TableHead>
                            )}
                            <TableHead>Name</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Units</TableHead>
                            {hasLevelTwoAccess && <TableHead></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSensors?.map((sensor) => (
                            <TableRow key={sensor.id}>
                                {hasLevelTwoAccess && (
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedSensors.has(sensor.id!)}
                                            onCheckedChange={() => toggleSelectSensor(sensor.id!)}
                                            aria-label={`Select sensor ${sensor.name ?? sensor.id}`}
                                        />
                                    </TableCell>
                                )}
                                <TableCell className='font-medium hover:underline cursor-default' onClick={() => handleSensorLinkClick(sensor.id as string)}>{sensor.name ?? '-'}</TableCell>
                                <TableCell className="cursor-default">{sensor.model ?? '-'}</TableCell>
                                <TableCell className="cursor-default">{sensor.location ?? '-'}</TableCell>
                                <TableCell className="cursor-default">{sensor.units ?? '-'}</TableCell>
                                {hasLevelTwoAccess && (
                                    <TableCell className='flex justify-end'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                    size="icon"
                                                >
                                                    <IconDotsVertical />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                                <EditSensorDialog fillSensor={sensor} editSensor={editSensor} />
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(sensor.id ?? '')}>Copy ID</DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => handleDelete(sensor.id as string)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default Page
