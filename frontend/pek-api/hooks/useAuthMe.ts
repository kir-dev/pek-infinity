import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { AuthMeQueryResponse, AuthMe401, AuthMe403, AuthMe500 } from "../types/AuthMe";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type AuthMeClient = typeof client<AuthMeQueryResponse, AuthMe401 | AuthMe403 | AuthMe500, never>;
type AuthMe = {
    data: AuthMeQueryResponse;
    error: AuthMe401 | AuthMe403 | AuthMe500;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: AuthMeQueryResponse;
    client: {
        parameters: Partial<Parameters<AuthMeClient>[0]>;
        return: Awaited<ReturnType<AuthMeClient>>;
    };
};
export const authMeQueryKey = () => [{ url: "/api/v4/auth/me" }] as const;
export type AuthMeQueryKey = ReturnType<typeof authMeQueryKey>;
export function authMeQueryOptions(options: AuthMe["client"]["parameters"] = {}) {
    const queryKey = authMeQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthMe["data"], AuthMe["error"]>({
                method: "get",
                url: `/api/v4/auth/me`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/me
 */
export function useAuthMe<TData = AuthMe["response"], TQueryData = AuthMe["response"], TQueryKey extends QueryKey = AuthMeQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AuthMe["response"], AuthMe["error"], TData, TQueryData, TQueryKey>>;
    client?: AuthMe["client"]["parameters"];
} = {}): UseQueryResult<TData, AuthMe["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authMeQueryKey();
    const query = useQuery({
        ...authMeQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthMe["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const authMeSuspenseQueryKey = () => [{ url: "/api/v4/auth/me" }] as const;
export type AuthMeSuspenseQueryKey = ReturnType<typeof authMeSuspenseQueryKey>;
export function authMeSuspenseQueryOptions(options: AuthMe["client"]["parameters"] = {}) {
    const queryKey = authMeSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<AuthMe["data"], AuthMe["error"]>({
                method: "get",
                url: `/api/v4/auth/me`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/auth/me
 */
export function useAuthMeSuspense<TData = AuthMe["response"], TQueryKey extends QueryKey = AuthMeSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AuthMe["response"], AuthMe["error"], TData, TQueryKey>>;
    client?: AuthMe["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, AuthMe["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authMeSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...authMeSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthMe["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}