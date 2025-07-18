import { IOrganisation } from "@/models/organisation";
import { retrieveOrganisation } from "@/services/firebase/retrieve";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";


interface UseOrganisationReturn {
    organisation: IOrganisation | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOrganisation(): UseOrganisationReturn {
    const { data: session, status } = useSession();
    const [organisation, setOrganisation] = useState<IOrganisation | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganisation = useCallback(async () => {
        // Reset states
        setLoading(true);
        setError(null);

        try {
            // Check if user is authenticated and has an organisation ID
            if (!session?.user?.organisation?.id) {
                setOrganisation(null);
                setLoading(false);
                return;
            }

            // Retrieve organisation data
            const orgData = await retrieveOrganisation({
                orgId: session.user.organisation.id
            });

            if (orgData) {
                setOrganisation(orgData);
            } else {
                setOrganisation(null);
                setError('Organisation not found');
            }
        } catch (err) {
            console.log('Error fetching organisation:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch organisation');
            setOrganisation(null);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.organisation?.id]);

    // Fetch organisation when session changes
    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
            return;
        }

        if (status === 'unauthenticated') {
            setOrganisation(null);
            setLoading(false);
            setError(null);
            return;
        }

        fetchOrganisation();
    }, [session, status, fetchOrganisation]);

    return {
        organisation,
        loading,
        error,
        refetch: fetchOrganisation,
    };
}
