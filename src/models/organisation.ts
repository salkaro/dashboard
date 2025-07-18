import { apiTokenRetentionLevels } from "@/utils/constants";

export type OrgRoleType = "viewer" | "developer" | "admin" | "owner";
export type SubscriptionType = keyof typeof apiTokenRetentionLevels;

interface IOrganisation {
    id?: string | null;
    name?: string | null;
    stripeCustomerId?: string | null;
    subscription?: SubscriptionType | null;
    members?: number | null;
    ownerId?: string | null;
    createdAt?: number | null;
}

export type { IOrganisation }