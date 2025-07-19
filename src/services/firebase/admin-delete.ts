"use server"

// Local Imports
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { retrieveUIDAdmin } from "./admin-retrieve";
import { devicesCol, inviteCodesCol, organisationsCol, tokensCol, usersCol } from "@/utils/constants";

// External Imports
import { firestore } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";


export async function deleteUserAdmin({ idToken, isOwner, orgId }: { idToken: string, isOwner?: boolean, orgId?: string }): Promise<{ success?: boolean; error?: string }> {
    try {
        // Step 1: Retrieve UID
        const uid = await retrieveUIDAdmin({ idToken });
        if (!uid) throw Error("User could not be found");

        // Step 2: Delete users documents
        const { error: deleteDocError } = await deleteUserDocsAdmin({ uid, isOwner, orgId });
        if (deleteDocError) throw deleteDocError;

        // Step 3: Delete users authentication
        const { error: deleteAuthError } = await deleteAuthUserAdmin({ uid });
        if (deleteAuthError) throw deleteAuthError;

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}


async function deleteAuthUserAdmin({ uid }: { uid: string }): Promise<{ success?: boolean; error?: string }> {
    try {
        await getAuth().deleteUser(uid);
        return { success: true };
    } catch (error) {
        console.error(`Failed to delete auth user: ${uid}`, error);
        return { error: (error as Error).message };
    }
}

async function deleteUserDocsAdmin({ uid, isOwner, orgId }: { uid: string, isOwner?: boolean, orgId?: string }): Promise<{ success?: boolean; error?: unknown }> {
    try {
        const userDocRef = firestoreAdmin.collection(usersCol).doc(uid);
        await userDocRef.delete();

        if (isOwner && orgId) {
            const tokensDocRef = firestoreAdmin.collection(tokensCol).doc(orgId);
            const devicesDocRef = firestoreAdmin.collection(devicesCol).doc(orgId);
            const organisationDocRef = firestoreAdmin.collection(organisationsCol).doc(orgId);

            await firestore().recursiveDelete(tokensDocRef);
            await firestore().recursiveDelete(devicesDocRef);
            await firestore().recursiveDelete(organisationDocRef);

            const inviteCodesQuery = await firestore()
                .collection(inviteCodesCol)
                .where('orgId', '==', orgId)
                .get();

            const batch = firestore().bulkWriter();
            inviteCodesQuery.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
            });
            await batch.close();
        }
            
        return { success: true };
    } catch (error) {
        console.error(`Failed to delete user ${uid} data`, error);
        return { error: `${error}` };
    }
}
