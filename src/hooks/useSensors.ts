import { ISensorMeta } from "@/models/sensor";
import { createSensor } from "@/services/firebase/create";
import { deleteDevice } from "@/services/firebase/delete";
import { retrieveOrganisation, retrieveDevices, retrieveDevice } from "@/services/firebase/retrieve";
import { updateDevice } from "@/services/firebase/update";
import { sensorsCol, sensorsCookieKey } from "@/utils/constants";
import { getCookie, setCookie } from "@/utils/cookie-handlers";
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

    const cookieKey = sensorId ? `sensor-${sensorId}` : sensorsCookieKey;
    const orgId = session?.user?.organisation?.id ?? null;

    const fetchSensors = useCallback(async ({ reload }: { reload?: boolean }) => {
        setLoading(true);
        setError(null);

        try {
            if (!orgId) {
                setSensors(null);
                setLoading(false);
                return;
            }

            if (!reload) {
                const cached = getCookie(cookieKey);
                if (cached) {
                    try {
                        setSensors(JSON.parse(cached));
                        setLoading(false);
                        return;
                    } catch { }
                }
            }

            const organisation = await retrieveOrganisation({ orgId });
            if (!organisation) {
                setSensors(null);
                setError("Organisation not found");
                return;
            }

            let fetchedSensors: ISensorMeta[] | null;
            if (sensorId) {
                const sensor = await retrieveDevice({ orgId, type: sensorsCol, deviceId: sensorId });
                fetchedSensors = sensor ? [sensor] : [];
            } else {
                fetchedSensors = await retrieveDevices({ orgId, type: sensorsCol }) ?? [];
            }

            setSensors(fetchedSensors ?? []);
            setCookie(cookieKey, JSON.stringify(fetchedSensors ?? []), { expires: 1 / 288 });
        } catch (err) {
            console.error("Error fetching sensors:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch sensors");
            setSensors(null);
        } finally {
            setLoading(false);
        }
    }, [sensorId, orgId, cookieKey]);

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
                const { data } = await createSensor({ sensor: newSensor, orgId });
                if (data) {
                    const updatedSensors = [...(sensors ?? []), data];
                    setSensors(updatedSensors);
                    setCookie(cookieKey, JSON.stringify(updatedSensors), { expires: 1 / 288 });
                }
            } catch (err) {
                console.error("Error adding sensor:", err);
                setError(err instanceof Error ? err.message : "Failed to add sensor");
            }
        },
        [orgId, cookieKey, sensors]
    );

    const editSensor = useCallback(
        async (updatedSensor: ISensorMeta) => {
            if (!orgId) {
                throw new Error("No organisation ID found.");
            }

            try {
                const { error } = await updateDevice({ device: updatedSensor, orgId, type: sensorsCol });
                if (error) throw error

                const updatedSensors = (sensors ?? []).map(sensor =>
                    sensor.id === updatedSensor.id ? updatedSensor : sensor
                );
                setSensors(updatedSensors);
                setCookie(cookieKey, JSON.stringify(updatedSensors), { expires: 1 / 288 });
            } catch (err) {
                console.error("Error editing sensor:", err);
                setError(err instanceof Error ? err.message : "Failed to edit sensor");
            }
        },
        [orgId, cookieKey, sensors]
    );

    const deleteSensor = useCallback(
        async (sensorId: string) => {
            if (!orgId) {
                throw new Error("No organisation ID found.");
            }

            try {
                await deleteDevice({ deviceId: sensorId, orgId, type: sensorsCol });
                const updatedSensors = (sensors ?? []).filter(sensor => sensor.id !== sensorId);
                setSensors(updatedSensors);
                setCookie(cookieKey, JSON.stringify(updatedSensors), { expires: 1 / 288 });
            } catch (err) {
                console.error("Error deleting sensor:", err);
                setError(err instanceof Error ? err.message : "Failed to delete sensor");
            }
        },
        [orgId, cookieKey, sensors]
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

        fetchSensors({});
    }, [status, session, fetchSensors]);

    const refetch = useCallback(async () => {
        await fetchSensors({ reload: true });
    }, [fetchSensors]);


    return {
        sensors,
        loading,
        error,
        refetch,
        addSensor,
        editSensor,
        deleteSensor
    };
}
