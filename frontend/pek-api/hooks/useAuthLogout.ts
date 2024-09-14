import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { AuthLogoutQueryResponse, AuthLogout401, AuthLogout403, AuthLogout500 } from "../types/AuthLogout";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type AuthLogoutClient = typeof client<AuthLogoutQueryResponse, AuthLogout401 | AuthLogout403 | AuthLogout500, never>;
type AuthLogout = {
    data: AuthLogoutQueryResponse;
    error: AuthLogout401 | AuthLogout403 | AuthLogout500;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: AuthLogoutQueryResponse;
    client: {
        parameters: Partial<Parameters<AuthLogoutClient>[0]>;
        return: Awaited<ReturnType<AuthLogoutClient>>;
    };
};
export const authLogoutQueryKey = () => [{ url: "/api/v4/auth/logout" }] as const;
export type AuthLogoutQueryKey = ReturnType<typeof authLogoutQueryKey>;
export function authLogoutQueryOptions(options: AuthLogout["client"]["parameters"] = {}) {
    const queryKey = authLogoutQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthLogout["data"], AuthLogout["error"]>({
                method: "get",
                url: `/api/v4/auth/logout`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/logout
 */
export function useAuthLogout<TData = AuthLogout["response"], TQueryData = AuthLogout["response"], TQueryKey extends QueryKey = AuthLogoutQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AuthLogout["response"], AuthLogout["error"], TData, TQueryData, TQueryKey>>;
    client?: AuthLogout["client"]["parameters"];
} = {}): UseQueryResult<TData, AuthLogout["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLogoutQueryKey();
    const query = useQuery({
        ...authLogoutQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthLogout["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const authLogoutSuspenseQueryKey = () => [{ url: "/api/v4/auth/logout" }] as const;
export type AuthLogoutSuspenseQueryKey = ReturnType<typeof authLogoutSuspenseQueryKey>;
export function authLogoutSuspenseQueryOptions(options: AuthLogout["client"]["parameters"] = {}) {
    const queryKey = authLogoutSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthLogout["data"], AuthLogout["error"]>({
                method: "get",
                url: `/api/v4/auth/logout`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/logout
 */
export function useAuthLogoutSuspense<TData = AuthLogout["response"], TQueryKey extends QueryKey = AuthLogoutSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AuthLogout["response"], AuthLogout["error"], TData, TQueryKey>>;
    client?: AuthLogout["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, AuthLogout["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLogoutSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...authLogoutSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthLogout["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}