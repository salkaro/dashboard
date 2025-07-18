"use client";

import { firestore } from "@/lib/firebase/config";
import { apiKeysCol, devicesCol, IDeviceType, organisationsCol, tokensCol, usersCol } from "@/utils/constants";
import { getAuth } from "firebase/auth";
import { deleteDoc, deleteField, doc, setDoc, updateDoc } from "firebase/firestore";
import { createOrganisation } from "./admin-create";
import { IOrganisation, OrgRoleType } from "@/models/organisation";
import { ISensorMeta } from "@/models/sensor";
import { IToken } from "@/models/token";
import { IUser } from "@/models/user";


export async function updateOnboarding({ firstname, lastname, organisation }: { firstname: string, lastname: string, organisation: string }) {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user || !user.email) {
            throw new Error("No authenticated user found.");
        }

        const { org, error } = await createOrganisation({ name: organisation, ownerId: user.uid, email: user.email })
        if (error || !org) throw error;

        const userRef = doc(firestore, usersCol, user.uid);

        await updateDoc(userRef, {
            firstname,
            lastname,
            organisation: {
                id: org.id,
                role: "owner",
                joinedAt: org.createdAt,
            },
            "authentication.onboarding": deleteField(),
        });

    } catch (error) {
        console.error("Failed to update onboarding info:", error);
        throw error;
    }
}


export async function updateAPIKey({ orgId, token, type, perms, prevId }: { orgId: string, token?: IToken, type: "delete" | "update" | "rotate", perms: OrgRoleType, prevId?: string | null }): Promise<{ success?: boolean, error?: string }> {
    try {
        if (!perms || perms === "viewer") return { error: "Invalid permissions" };

        if (!token || !token.id) {
            return { error: "Missing token or token.id" };
        }

        const tokenRef = doc(firestore, tokensCol, orgId, apiKeysCol, token.id);

        if (type === "delete") {
            await deleteDoc(tokenRef);
        } else if (type === "update") {
            await setDoc(tokenRef, token, { merge: true });
        } else if (type === "rotate" && prevId) {
            const oldRef = doc(firestore, tokensCol, orgId, apiKeysCol, prevId);
            await deleteDoc(oldRef);
            await setDoc(tokenRef, token, { merge: true });
        }

        return { success: true }

    } catch (error) {
        return { error: `${error}` }
    }
}


export async function updateUser({ user }: { user: IUser }) {
    try {
        const { id, ...updatableFields } = user;
        
        const ref = doc(firestore, usersCol, id as string);
        await updateDoc(ref, updatableFields);

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}


export async function updateOrganisation({ organisation }: { organisation: IOrganisation }) {
    try {
        const { id, ...updatableFields } = organisation;

        const ref = doc(firestore, organisationsCol, id as string);
        await updateDoc(ref, updatableFields);

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}

export async function updateDevice({ device, orgId, type }: { device: ISensorMeta; orgId: string; type: IDeviceType }): Promise<{ error?: string }> {
    try {
        if (!device.id) {
            throw new Error("Device ID is required for editing.");
        }

        const deviceRef = doc(firestore, devicesCol, orgId, type, device.id);
        await setDoc(deviceRef, device, { merge: true });
        return {};
    } catch (error) {
        return { error: `${error}` };
    }
}