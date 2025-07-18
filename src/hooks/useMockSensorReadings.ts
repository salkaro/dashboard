import { ISensorReading } from '@/models/sensor';
import { useEffect, useState, useRef, useMemo } from 'react';

interface Options {
    sensorIds: string[];
    intervalMs?: number;  
    valueRange?: [number, number];
    enabled?: boolean;    
}


export function useMockSensorReadings({
    sensorIds,
    intervalMs = 1000,
    valueRange = [0, 100],
    enabled = true,
}: Options) {
    const [readings, setReadings] = useState<ISensorReading[]>([]);
    const timerRef = useRef<number | null>(null);

    // Create a stable key for sensorIds to prevent effect re-run on array identity change
    const sensorIdsKey = useMemo(() => sensorIds.join(","), [sensorIds]);

    useEffect(() => {
        if (!enabled) return;

        function generateReading(sensorId: string): ISensorReading {
            const value = Number(
                (Math.random() * (valueRange[1] - valueRange[0]) + valueRange[0]).toFixed(2)
            );
            let status: ISensorReading['status'] = 'OK';
            if (value > valueRange[1] * 0.9) status = 'WARN';
            if (value > valueRange[1]) status = 'FAULT';
            return {
                sensorId,
                timestamp: Date.now(),
                value,
                status,
            };
        }

        // Start interval to generate readings
        timerRef.current = window.setInterval(() => {
            const newReadings = sensorIds.map(id => generateReading(id));
            setReadings(prev => [...prev, ...newReadings].slice(-1000)); // keep last 1000 points
        }, intervalMs);

        return () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
        // Depend only on primitives and stable sensorIdsKey
    }, [intervalMs, valueRange, sensorIdsKey, enabled, sensorIds]);

    return readings;
}
