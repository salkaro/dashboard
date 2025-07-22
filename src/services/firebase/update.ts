"use client";

import { auth, firestore } from "@/lib/firebase/config";
import { apiKeysCol, devicesCol, IDeviceType, organisationsCol, tokensCol, usersCol } from "@/utils/constants";
import { deleteDoc, deleteField, doc, FieldValue, setDoc, updateDoc } from "firebase/firestore";
import { createOrganisation } from "./admin-create";
import { IOrganisation, OrgRoleType } from "@/models/organisation";
import { ISensorMeta } from "@/models/sensor";
import { IToken } from "@/models/token";
import { IUser } from "@/models/user";
import { incrementOrganisationMembersCount } from "./admin-increment";
import { retrieveIdToken } from "./retrieve";


export async function updateOnboarding({ firstname, lastname, organisation }: { firstname: string, lastname: string, organisation?: string }) {
    try {
        const user = auth.currentUser;

        if (!user || !user.email) {
            throw new Error("No authenticated user found.");
        }


        const userRef = doc(firestore, usersCol, user.uid);

        const updatePayload: { [x: string]: FieldValue | Partial<unknown> | undefined; } = {
            firstname,
            lastname,
            "authentication.onboarding": deleteField(),
        }


        if (organisation) {
            const { org, error } = await createOrganisation({
                name: organisation,
                ownerId: user.uid,
                email: user.email,
            })

            if (error || !org) throw error

            updatePayload.organisation = {
                id: org.id,
                role: "owner",
                joinedAt: org.createdAt,
            }
        }

        await updateDoc(userRef, updatePayload);
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


export async function updateOrganisationMember({ member, organisation, remove }: { member: IUser, organisation?: IOrganisation, remove?: boolean }) {
    try {
        const userRef = doc(firestore, usersCol, member.id as string);

        if (remove && organisation && organisation.members) {
            const idToken = await retrieveIdToken();
            if (!idToken) throw new Error("User not found");

            await updateDoc(userRef, {
                organisation: deleteField(),
            });

            await incrementOrganisationMembersCount({ idToken, orgId: organisation.id as string, negate: true })
        }

        await updateDoc(userRef, {
            "organisation.role": member.organisation?.role,
        });

        return { success: true };
    } catch (error) {
        console.error(`Error in updateOrganisationMember: ${error}`);
        return { error: `${error}` }
    }
}