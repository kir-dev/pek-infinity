import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { AuthOauthRedirectQueryResponse, AuthOauthRedirectQueryParams, AuthOauthRedirect401, AuthOauthRedirect403, AuthOauthRedirect500 } from "../types/AuthOauthRedirect";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type AuthOauthRedirectClient = typeof client<AuthOauthRedirectQueryResponse, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500, never>;
type AuthOauthRedirect = {
    data: AuthOauthRedirectQueryResponse;
    error: AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500;
    request: never;
    pathParams: never;
    queryParams: AuthOauthRedirectQueryParams;
    headerParams: never;
    response: AuthOauthRedirectQueryResponse;
    client: {
        parameters: Partial<Parameters<AuthOauthRedirectClient>[0]>;
        return: Awaited<ReturnType<AuthOauthRedirectClient>>;
    };
};
export const authOauthRedirectQueryKey = (params: AuthOauthRedirect["queryParams"]) => [{ url: "/api/v4/auth/callback" }, ...(params ? [params] : [])] as const;
export type AuthOauthRedirectQueryKey = ReturnType<typeof authOauthRedirectQueryKey>;
export function authOauthRedirectQueryOptions(params: AuthOauthRedirect["queryParams"], options: AuthOauthRedirect["client"]["parameters"] = {}) {
    const queryKey = authOauthRedirectQueryKey(params);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthOauthRedirect["data"], AuthOauthRedirect["error"]>({
                method: "get",
                url: `/api/v4/auth/callback`,
                params,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/callback
 */
export function useAuthOauthRedirect<TData = AuthOauthRedirect["response"], TQueryData = AuthOauthRedirect["response"], TQueryKey extends QueryKey = AuthOauthRedirectQueryKey>(params: AuthOauthRedirect["queryParams"], options: {
    query?: Partial<QueryObserverOptions<AuthOauthRedirect["response"], AuthOauthRedirect["error"], TData, TQueryData, TQueryKey>>;
    client?: AuthOauthRedirect["client"]["parameters"];
} = {}): UseQueryResult<TData, AuthOauthRedirect["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authOauthRedirectQueryKey(params);
    const query = useQuery({
        ...authOauthRedirectQueryOptions(params, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthOauthRedirect["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const authOauthRedirectSuspenseQueryKey = (params: AuthOauthRedirect["queryParams"]) => [{ url: "/api/v4/auth/callback" }, ...(params ? [params] : [])] as const;
export type AuthOauthRedirectSuspenseQueryKey = ReturnType<typeof authOauthRedirectSuspenseQueryKey>;
export function authOauthRedirectSuspenseQueryOptions(params: AuthOauthRedirect["queryParams"], options: AuthOauthRedirect["client"]["parameters"] = {}) {
    const queryKey = authOauthRedirectSuspenseQueryKey(params);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthOauthRedirect["data"], AuthOauthRedirect["error"]>({
                method: "get",
                url: `/api/v4/auth/callback`,
                params,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/callback
 */
export function useAuthOauthRedirectSuspense<TData = AuthOauthRedirect["response"], TQueryKey extends QueryKey = AuthOauthRedirectSuspenseQueryKey>(params: AuthOauthRedirect["queryParams"], options: {
    query?: Partial<UseSuspenseQueryOptions<AuthOauthRedirect["response"], AuthOauthRedirect["error"], TData, TQueryKey>>;
    client?: AuthOauthRedirect["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, AuthOauthRedirect["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authOauthRedirectSuspenseQueryKey(params);
    const query = useSuspenseQuery({
        ...authOauthRedirectSuspenseQueryOptions(params, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthOauthRedirect["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}