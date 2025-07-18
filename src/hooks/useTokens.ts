import { IToken } from "@/models/token";
import { retrieveTokens } from "@/services/firebase/retrieve";
import { useState, useEffect, useCallback } from "react";

interface UseTokensReturn {
    tokens: IToken[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useTokens(orgId: string | null): UseTokensReturn {
    const [tokens, setTokens] = useState<IToken[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTokens = useCallback(async () => {
        if (!orgId) {
            setTokens(null);
            setError("No organization ID provided");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await retrieveTokens({ orgId });
            setTokens(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch tokens");
            setTokens(null);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchTokens();
    }, [fetchTokens]);

    return { tokens, loading, error, refetch: fetchTokens };
}
