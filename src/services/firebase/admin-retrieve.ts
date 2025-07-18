"use server";

import { IUser } from "@/models/user";
import { usersCol } from "@/utils/constants";
import { firestoreAdmin } from "@/lib/firebase/config-admin";

export async function retrieveUserAdmin({ uid }: { uid: string }): Promise<IUser | void> {
    try {
        // Step 1: Retrieve document reference & snapshot
        const docRef = firestoreAdmin.collection(usersCol).doc(uid)
        const snapshot = await docRef.get();

        // Step 2: If snapshot exists return snapshot data
        if (snapshot.exists) {
            return snapshot.data() as IUser;
        }
    } catch (error) {
        console.error(`Error in retrieveConnectedAccountAdmin: ${error}`);
    }
}