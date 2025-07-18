import { firestore } from "@/lib/firebase/config";
import { doc, deleteDoc } from "firebase/firestore";
import { devicesCol, IDeviceType } from "@/utils/constants";


export async function deleteDevice({ deviceId, orgId, type }: { deviceId: string, orgId: string, type: IDeviceType }): Promise<{ error?: string }> {
    try {
        const deviceRef = doc(firestore, devicesCol, orgId, type, deviceId);
        await deleteDoc(deviceRef);
        return {};
    } catch (error) {
        return { error: `${error}` };
    }
}
