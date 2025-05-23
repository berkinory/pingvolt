import { useMutation, useQuery } from '@tanstack/react-query';

type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

type SubscriptionResponse = {
    userId: string;
    active: boolean;
    expiresAt: string | null;
};

type Website = {
    id: number;
    userId: string;
    mail: string;
    mailNotifications: boolean;
    url: string;
    interval: number;
    updatedAt: string;
    status: boolean;
    isActive: boolean;
};

type HistoryEntry = {
    id: number;
    websiteId: number;
    timestamp: string;
    status: string;
    latency: number;
};

type WebsiteHistoryResponse = {
    website: Website;
    history: HistoryEntry[];
};

async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) {
        throw new Error(data.message || data.error || 'An error occurred');
    }
    return data.data as T;
}

export function useApiQuery<T>(
    queryKey: string[],
    endpoint: string,
    options?: {
        enabled?: boolean;
        refetchInterval?: number;
    }
) {
    return useQuery({
        queryKey,
        queryFn: () => apiFetch<T>(endpoint),
        ...options,
    });
}

export function useApiMutation<TData, TVariables>(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    options?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: Error) => void;
    }
) {
    return useMutation({
        mutationFn: async (variables: TVariables) => {
            return apiFetch<TData>(endpoint, {
                method,
                body: JSON.stringify(variables),
            });
        },
        ...options,
    });
}

export function useSubscription() {
    return useApiQuery<SubscriptionResponse>(
        ['subscription'],
        '/api/subscription'
    );
}

export function useWebsites() {
    return useApiQuery<Website[]>(['websites'], '/api/websites');
}

export function useWebsiteHistory(websiteId: number | null) {
    return useApiQuery<WebsiteHistoryResponse>(
        ['website', websiteId?.toString() || '', 'history'],
        `/api/history/${websiteId}`,
        {
            enabled: !!websiteId,
        }
    );
}
