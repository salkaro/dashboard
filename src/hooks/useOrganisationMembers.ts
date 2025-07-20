import { IUser } from "@/models/user";
import { retrieveIdToken } from "@/services/firebase/retrieve";
import { membersCookieKey } from "@/utils/constants";
import { getCookie, setCookie } from "@/utils/cookie-handlers";
import { retrieveOrganisationMembers } from "@/services/firebase/admin-retrieve";
import { useState, useEffect, useCallback } from "react";

interface UseOrganisationMembersReturn {
    members: IUser[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrganisationMembers(orgId: string | null): UseOrganisationMembersReturn {
    const [members, setMembers] = useState<IUser[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(
        async ({ reload = false } = {}) => {
            if (!orgId) {
                setMembers(null);
                setError("No organisation ID provided");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Step 1: Try cache
                if (!reload) {
                    const cached = getCookie(membersCookieKey);
                    if (cached) {
                        setMembers(JSON.parse(cached));
                        setLoading(false);
                        return;
                    }
                }

                // Step 2: Get Firebase ID token
                const idToken = await retrieveIdToken()
                if (!idToken) {
                    throw new Error("No id token found")
                }

                // Step 3: Fetch from backend
                const { members: fetched, error: err } = await retrieveOrganisationMembers({ idToken, orgId });
                if (err) {
                    throw new Error(err);
                }

                setMembers(fetched ?? []);
                // Step 4: Cache for 1 hour
                setCookie(membersCookieKey, JSON.stringify(fetched ?? []), { expires: 1 / 24 });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch members");
                setMembers(null);
            } finally {
                setLoading(false);
            }
        },
        [orgId]
    );

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const refetch = useCallback(async () => {
        await fetchMembers({ reload: true });
    }, [fetchMembers]);

    return { members, loading, error, refetch };
}
