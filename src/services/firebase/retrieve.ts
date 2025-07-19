// Local Impoorts
import { IUser } from "@/models/user";
import { IToken } from "@/models/token";
import { createUser } from "./admin-create";
import { ISensorMeta } from "@/models/sensor";
import { IOrganisation } from "@/models/organisation";
import { auth, firestore } from "@/lib/firebase/config";
import { apiKeysCol, devicesCol, IDeviceType, organisationsCol, tokensCol, usersCol } from "@/utils/constants";

// External Imports
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export async function retrieveIdToken() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const idToken = await user?.getIdToken();
        if (!idToken) return;

        return idToken;
    } catch (error) {
        console.error(error)
    }
}

export async function retrieveUserAndCreate({ uid, email }: { uid: string, email?: string | null }): Promise<IUser | void> {
    try {
        // Step 1: Retrieve document reference
        const docRef = doc(firestore, usersCol, uid);
        const userDoc = await getDoc(docRef);

        // Step 2: Check if the user document exists
        if (userDoc.exists()) {
            // Step 3: Extract & return the user data as an IUser object
            return userDoc.data() as IUser;
        } else {
            if (!email) throw new Error('Email is required to create a new user');

            // Step 4: Create a new user
            return await createUser({ uid, email })
        }
    } catch (error) {
        console.error('Error retrieving user from Firestore:', error);
    }
}


export async function retrieveUser({ uid }: { uid: string }): Promise<IUser | void> {
    try {
        // Step 1: Retrieve document reference
        const docRef = doc(firestore, usersCol, uid);
        const userDoc = await getDoc(docRef);

        // Step 2: Check if the user document exists
        if (userDoc.exists()) {
            // Step 3: Extract & return the user data as an IUser object
            return userDoc.data() as IUser;
        }
    } catch (error) {
        console.error('Error retrieving user from Firestore:', error);
    }
}


export async function retrieveOrganisation({ orgId }: { orgId: string }): Promise<IOrganisation | void> {
    try {
        // Step 1: Retrieve document reference
        const docRef = doc(firestore, organisationsCol, orgId);
        const orgDoc = await getDoc(docRef);

        // Step 2: Check if the organisation document exists
        if (orgDoc.exists()) {
            // Step 3: Extract & return the organisation data
            return orgDoc.data() as IOrganisation;
        }
    } catch (error) {
        console.error('Error retrieving organisation from Firestore:', error);
        throw error;
    }
}


export async function retrieveDevices({ orgId, type }: { orgId: string, type: IDeviceType }): Promise<ISensorMeta[] | void> {
    try {
        // Step 1: Reference to the devices 
        const devicesRef = collection(firestore, devicesCol, orgId, type);

        // Step 2: Fetch all documents from the subcollection
        const snapshot = await getDocs(devicesRef);

        // Step 3: Aggregate data
        const data = snapshot.docs.map(doc => doc.data());

        return data
    } catch (error) {
        console.error('Error retrieving devices from Firestore:', error);
        throw error;
    }
}


export async function retrieveDevice({ orgId, type, deviceId }: { orgId: string; type: IDeviceType; deviceId: string; }): Promise<ISensorMeta | null> {
    try {
        // Step 1: Reference to the document
        const docRef = doc(firestore, devicesCol, orgId, type, deviceId);

        // Step 2: Check the document exists
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return null;
        }

        return docSnap.data() as ISensorMeta;
    } catch (error) {
        console.error("Error retrieving device from Firestore:", error);
        throw error;
    }
}




export async function retrieveTokens({ orgId }: { orgId: string }): Promise<IToken[]> {
    try {
        // Step 1: Reference to the tokens subcollection
        const tokensRef = collection(firestore, tokensCol, orgId, apiKeysCol);

        // Step 2: Fetch all documents
        const snapshot = await getDocs(tokensRef);

        // Step 3: Aggregate token data
        const tokens: IToken[] = snapshot.docs.map(doc => doc.data() as IToken);

        return tokens;
    } catch (error) {
        console.error('Error retrieving tokens from Firestore:', error);
        throw error;
    }
}