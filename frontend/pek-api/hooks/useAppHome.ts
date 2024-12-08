import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { AppHomeQueryResponse } from "../types/AppHome";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type AppHomeClient = typeof client<AppHomeQueryResponse, never, never>;
type AppHome = {
    data: AppHomeQueryResponse;
    error: never;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: AppHomeQueryResponse;
    client: {
        parameters: Partial<Parameters<AppHomeClient>[0]>;
        return: Awaited<ReturnType<AppHomeClient>>;
    };
};
export const appHomeQueryKey = () => [{ url: "/" }] as const;
export type AppHomeQueryKey = ReturnType<typeof appHomeQueryKey>;
export function appHomeQueryOptions(options: AppHome["client"]["parameters"] = {}) {
    const queryKey = appHomeQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AppHome["data"], AppHome["error"]>({
                method: "get",
                url: `/`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /
 */
export function useAppHome<TData = AppHome["response"], TQueryData = AppHome["response"], TQueryKey extends QueryKey = AppHomeQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AppHome["response"], AppHome["error"], TData, TQueryData, TQueryKey>>;
    client?: AppHome["client"]["parameters"];
} = {}): UseQueryResult<TData, AppHome["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? appHomeQueryKey();
    const query = useQuery({
        ...appHomeQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AppHome["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const appHomeSuspenseQueryKey = () => [{ url: "/" }] as const;
export type AppHomeSuspenseQueryKey = ReturnType<typeof appHomeSuspenseQueryKey>;
export function appHomeSuspenseQueryOptions(options: AppHome["client"]["parameters"] = {}) {
    const queryKey = appHomeSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AppHome["data"], AppHome["error"]>({
                method: "get",
                url: `/`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /
 */
export function useAppHomeSuspense<TData = AppHome["response"], TQueryKey extends QueryKey = AppHomeSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AppHome["response"], AppHome["error"], TData, TQueryKey>>;
    client?: AppHome["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, AppHome["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? appHomeSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...appHomeSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AppHome["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}