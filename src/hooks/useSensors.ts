import { ISensorMeta } from "@/models/sensor";
import { createSensor } from "@/services/firebase/create";
import { deleteDevice } from "@/services/firebase/delete";
import { retrieveOrganisation, retrieveDevices, retrieveDevice } from "@/services/firebase/retrieve";
import { updateDevice } from "@/services/firebase/update";
import { sensorsCol } from "@/utils/constants";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";


interface UseSensorsOptions {
    sensorId?: string;
}

interface UseSensorsReturn {
    sensors: ISensorMeta[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addSensor: (sensor: ISensorMeta) => Promise<void>;
    editSensor: (sensor: ISensorMeta) => Promise<void>;
    deleteSensor: (sensorId: string) => Promise<void>;
}

export function useSensors({ sensorId }: UseSensorsOptions = {}): UseSensorsReturn {
    const { data: session, status } = useSession();
    const [sensors, setSensors] = useState<ISensorMeta[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const orgId = session?.user?.organisation?.id ?? null;

    const fetchSensors = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const orgId = session?.user?.organisation?.id;
            if (!orgId) {
                setSensors(null);
                setLoading(false);
                return;
            }

            const organisation = await retrieveOrganisation({ orgId });

            if (!organisation) {
                setSensors(null);
                setError("Organisation not found");
                return;
            }

            if (sensorId) {
                // Fetch single sensor
                const sensor = await retrieveDevice({ orgId, type: sensorsCol, deviceId: sensorId });
                setSensors(sensor ? [sensor] : []);
            } else {
                // Fetch all sensors
                const sensorList = await retrieveDevices({ orgId, type: sensorsCol });
                setSensors(sensorList ?? []);
            }
        } catch (err) {
            console.error("Error fetching sensors:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch sensors");
            setSensors(null);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.organisation?.id, sensorId]);

    const addSensor = useCallback(
        async (sensor: ISensorMeta) => {
            if (!orgId) {
                throw new Error("No organisation ID found.");
            }

            const newSensor: ISensorMeta = {
                ...sensor,
                orgId,
                createdAt: Date.now(),
            };

            try {
                await createSensor({ sensor: newSensor, orgId });
                await fetchSensors();
            } catch (err) {
                console.error("Error adding sensor:", err);
                setError(err instanceof Error ? err.message : "Failed to add sensor");
            }
        },
        [orgId, fetchSensors]
    );

    const editSensor = useCallback(
        async (sensor: ISensorMeta) => {
            if (!orgId) {
                throw new Error("No organisation ID found.");
            }

            try {
                const { error } = await updateDevice({ device: sensor, orgId, type: sensorsCol });
                if (error) throw error
                await fetchSensors();
            } catch (err) {
                console.error("Error editing sensor:", err);
                setError(err instanceof Error ? err.message : "Failed to edit sensor");
            }
        },
        [orgId, fetchSensors]
    );

    const deleteSensor = useCallback(
        async (sensorId: string) => {
            if (!orgId) {
                throw new Error("No organisation ID found.");
            }

            try {
                await deleteDevice({ deviceId: sensorId, orgId, type: sensorsCol });
                await fetchSensors();
            } catch (err) {
                console.error("Error deleting sensor:", err);
                setError(err instanceof Error ? err.message : "Failed to delete sensor");
            }
        },
        [orgId, fetchSensors]
    );

    useEffect(() => {
        if (status === "loading") {
            setLoading(true);
            return;
        }

        if (status === "unauthenticated") {
            setSensors(null);
            setLoading(false);
            setError(null);
            return;
        }

        fetchSensors();
    }, [status, session, fetchSensors]);

    return {
        sensors,
        loading,
        error,
        refetch: fetchSensors,
        addSensor,
        editSensor,
        deleteSensor
    };
}
