import { firestore } from "@/lib/firebase/config";
import { IMemberInvite } from "@/models/invite";
import { ISensorMeta } from "@/models/sensor";
import { devicesCol, inviteCodesCol, sensorsCol } from "@/utils/constants";
import { collection, doc, setDoc } from "firebase/firestore";

export async function createSensor({ sensor, orgId }: { sensor: ISensorMeta, orgId: string }): Promise<{ error?: string, data?: ISensorMeta }> {
    try {
        const sensorRef = doc(collection(firestore, devicesCol, orgId, sensorsCol));
        const sensorWithId: ISensorMeta = {
            ...sensor,
            id: sensorRef.id,
        };
        await setDoc(sensorRef, sensorWithId);
        return { data: sensorWithId };
    } catch (error) {
        return { error: `${error}` };
    }
}

export async function createMemberInvite({ invite }: { invite: IMemberInvite }): Promise<{ code?: string; error?: string }> {
    try {
        const inviteRef = doc(
            firestore,
            inviteCodesCol,
            invite.id as string
        );

        const inviteData: IMemberInvite = {
            ...invite,
            createdAt: Date.now(),
        };

        await setDoc(inviteRef, inviteData);

        return { code: invite.id as string };
    } catch (error) {
        return { error: `${error}` };
    }
}