import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { PingSendQueryResponse, PingSend500 } from "../types/PingSend";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type PingSendClient = typeof client<PingSendQueryResponse, PingSend500, never>;
type PingSend = {
    data: PingSendQueryResponse;
    error: PingSend500;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: PingSendQueryResponse;
    client: {
        parameters: Partial<Parameters<PingSendClient>[0]>;
        return: Awaited<ReturnType<PingSendClient>>;
    };
};
export const pingSendQueryKey = () => [{ url: "/api/v4/ping" }] as const;
export type PingSendQueryKey = ReturnType<typeof pingSendQueryKey>;
export function pingSendQueryOptions(options: PingSend["client"]["parameters"] = {}) {
    const queryKey = pingSendQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<PingSend["data"], PingSend["error"]>({
                method: "get",
                url: `/api/v4/ping`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * @link /api/v4/ping
 */
export function usePingSend<TData = PingSend["response"], TQueryData = PingSend["response"], TQueryKey extends QueryKey = PingSendQueryKey>(options: {
    query?: Partial<QueryObserverOptions<PingSend["response"], PingSend["error"], TData, TQueryData, TQueryKey>>;
    client?: PingSend["client"]["parameters"];
} = {}): UseQueryResult<TData, PingSend["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? pingSendQueryKey();
    const query = useQuery({
        ...pingSendQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, PingSend["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const pingSendSuspenseQueryKey = () => [{ url: "/api/v4/ping" }] as const;
export type PingSendSuspenseQueryKey = ReturnType<typeof pingSendSuspenseQueryKey>;
export function pingSendSuspenseQueryOptions(options: PingSend["client"]["parameters"] = {}) {
    const queryKey = pingSendSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<PingSend["data"], PingSend["error"]>({
                method: "get",
                url: `/api/v4/ping`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * @link /api/v4/ping
 */
export function usePingSendSuspense<TData = PingSend["response"], TQueryKey extends QueryKey = PingSendSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<PingSend["response"], PingSend["error"], TData, TQueryKey>>;
    client?: PingSend["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, PingSend["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? pingSendSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...pingSendSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, PingSend["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}