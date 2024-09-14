import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { AuthLoginQueryResponse, AuthLogin401, AuthLogin403, AuthLogin500 } from "../types/AuthLogin";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type AuthLoginClient = typeof client<AuthLoginQueryResponse, AuthLogin401 | AuthLogin403 | AuthLogin500, never>;
type AuthLogin = {
    data: AuthLoginQueryResponse;
    error: AuthLogin401 | AuthLogin403 | AuthLogin500;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: AuthLoginQueryResponse;
    client: {
        parameters: Partial<Parameters<AuthLoginClient>[0]>;
        return: Awaited<ReturnType<AuthLoginClient>>;
    };
};
export const authLoginQueryKey = () => [{ url: "/api/v4/auth/login" }] as const;
export type AuthLoginQueryKey = ReturnType<typeof authLoginQueryKey>;
export function authLoginQueryOptions(options: AuthLogin["client"]["parameters"] = {}) {
    const queryKey = authLoginQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthLogin["data"], AuthLogin["error"]>({
                method: "get",
                url: `/api/v4/auth/login`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/login
 */
export function useAuthLogin<TData = AuthLogin["response"], TQueryData = AuthLogin["response"], TQueryKey extends QueryKey = AuthLoginQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AuthLogin["response"], AuthLogin["error"], TData, TQueryData, TQueryKey>>;
    client?: AuthLogin["client"]["parameters"];
} = {}): UseQueryResult<TData, AuthLogin["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLoginQueryKey();
    const query = useQuery({
        ...authLoginQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthLogin["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const authLoginSuspenseQueryKey = () => [{ url: "/api/v4/auth/login" }] as const;
export type AuthLoginSuspenseQueryKey = ReturnType<typeof authLoginSuspenseQueryKey>;
export function authLoginSuspenseQueryOptions(options: AuthLogin["client"]["parameters"] = {}) {
    const queryKey = authLoginSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthLogin["data"], AuthLogin["error"]>({
                method: "get",
                url: `/api/v4/auth/login`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/login
 */
export function useAuthLoginSuspense<TData = AuthLogin["response"], TQueryKey extends QueryKey = AuthLoginSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AuthLogin["response"], AuthLogin["error"], TData, TQueryKey>>;
    client?: AuthLogin["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, AuthLogin["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLoginSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...authLoginSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthLogin["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}