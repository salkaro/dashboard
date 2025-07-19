"use client";

import Chart from '@/components/ui/data-chart';
import NoContent from '@/components/ui/no-content';
import TimeRangeSelector, { ITimeRangeHighRes } from '@/components/ui/time-range-selector'
import { useSensors } from '@/hooks/useSensors';
import { IReadingType, ISensorReading } from '@/models/sensor';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const Page = () => {
    const params = useParams();
    const sensorId = params.sensorId as string;
    const { sensors } = useSensors({ sensorId })

    const [timeRange, setTimeRange] = useState<ITimeRangeHighRes>("30m");

    const [readings, setReadings] = useState<ISensorReading[]>();

    function formatReadings(unformatted: { timestamp: string, value: IReadingType, status: string }[]): ISensorReading[] {
        return unformatted.map((r) => ({
            timestamp: new Date(r.timestamp).getTime(),
            value: r.value,
            status: r.status
        }));
    }

    useEffect(() => {
        const fetchReadings = async () => {
            const res = await fetch(`/api/sensor-readings?sensorId=${sensorId}&range=${timeRange}&retention=7d`);
            const data = await res.json();
            setReadings(formatReadings(data.readings));
        };

        fetchReadings();

        const interval = setInterval(fetchReadings, 30_000); // Fetch live every 30 seconds

        return () => clearInterval(interval);
    }, [sensorId, timeRange]);

    if (!sensors?.[0]) {
        return (
            <NoContent text="Sensor wasn't found" />
        )
    }

    return (
        <div>
            {/* Header */}
            <div className='mb-4'>
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>
            <Chart sensor={sensors[0]} sensorReadings={readings ?? []} timeRange={timeRange} />
        </div>
    )
}

export default Page
