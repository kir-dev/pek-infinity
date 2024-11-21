import client from "@kubb/plugin-client/client";
import type { AuthMeQueryResponse, AuthMe401, AuthMe403, AuthMe500 } from "../types/AuthMe.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const authMeSuspenseQueryKey = () => [{ url: "/api/v4/auth/me" }] as const;

 export type AuthMeSuspenseQueryKey = ReturnType<typeof authMeSuspenseQueryKey>;

 /**
 * {@link /api/v4/auth/me}
 */
async function authMe(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthMeQueryResponse, AuthMe401 | AuthMe403 | AuthMe500, unknown>({ method: "GET", url: `/api/v4/auth/me`, ...config });
    return res.data;
}

 export function authMeSuspenseQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = authMeSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return authMe(config);
        },
    });
}

 /**
 * {@link /api/v4/auth/me}
 */
export function useAuthMeSuspense<TData = AuthMeQueryResponse, TQueryData = AuthMeQueryResponse, TQueryKey extends QueryKey = AuthMeSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AuthMeQueryResponse, AuthMe401 | AuthMe403 | AuthMe500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authMeSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...authMeSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthMe401 | AuthMe403 | AuthMe500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}