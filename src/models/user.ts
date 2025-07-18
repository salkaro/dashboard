import { OrgRoleType } from "./organisation";

export type EmailVerification = "unverified" | "verifying" | "verified";


interface IUser {
    authentication?: IAuthentication | null;
    email?: string | null;
    id?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    metadata?: IMetaData;
    organisation?: IOrganisation;
}


interface IOrganisation {
    id?: string | null;
    role?: OrgRoleType | null;
    joinedAt?: number | null;
}

interface IAuthentication {
    emailVerified?: EmailVerification;
    onboarding?: boolean | null;
}


interface IMetaData {
    createdAt?: number | null;
}


export type { IUser }