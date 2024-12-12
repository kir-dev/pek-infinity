import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { AppPingQueryResponse } from "../types/AppPing";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type AppPingClient = typeof client<AppPingQueryResponse, never, never>;
type AppPing = {
    data: AppPingQueryResponse;
    error: never;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: AppPingQueryResponse;
    client: {
        parameters: Partial<Parameters<AppPingClient>[0]>;
        return: Awaited<ReturnType<AppPingClient>>;
    };
};
export const appPingQueryKey = () => [{ url: "/ping" }] as const;
export type AppPingQueryKey = ReturnType<typeof appPingQueryKey>;
export function appPingQueryOptions(options: AppPing["client"]["parameters"] = {}) {
    const queryKey = appPingQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AppPing["data"], AppPing["error"]>({
                method: "get",
                url: `/ping`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * @link /ping
 */
export function useAppPing<TData = AppPing["response"], TQueryData = AppPing["response"], TQueryKey extends QueryKey = AppPingQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AppPing["response"], AppPing["error"], TData, TQueryData, TQueryKey>>;
    client?: AppPing["client"]["parameters"];
} = {}): UseQueryResult<TData, AppPing["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? appPingQueryKey();
    const query = useQuery({
        ...appPingQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AppPing["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const appPingSuspenseQueryKey = () => [{ url: "/ping" }] as const;
export type AppPingSuspenseQueryKey = ReturnType<typeof appPingSuspenseQueryKey>;
export function appPingSuspenseQueryOptions(options: AppPing["client"]["parameters"] = {}) {
    const queryKey = appPingSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AppPing["data"], AppPing["error"]>({
                method: "get",
                url: `/ping`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * @link /ping
 */
export function useAppPingSuspense<TData = AppPing["response"], TQueryKey extends QueryKey = AppPingSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AppPing["response"], AppPing["error"], TData, TQueryKey>>;
    client?: AppPing["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, AppPing["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? appPingSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...appPingSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AppPing["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}