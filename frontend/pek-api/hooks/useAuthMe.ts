import client from "@kubb/plugin-client/client";
import type { AuthMeQueryResponse, AuthMe401, AuthMe403, AuthMe500 } from "../types/AuthMe.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const authMeQueryKey = () => [{ url: "/api/v4/auth/me" }] as const;

 export type AuthMeQueryKey = ReturnType<typeof authMeQueryKey>;

 /**
 * {@link /api/v4/auth/me}
 */
async function authMe(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthMeQueryResponse, AuthMe401 | AuthMe403 | AuthMe500, unknown>({ method: "GET", url: `/api/v4/auth/me`, ...config });
    return res.data;
}

 export function authMeQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = authMeQueryKey();
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
export function useAuthMe<TData = AuthMeQueryResponse, TQueryData = AuthMeQueryResponse, TQueryKey extends QueryKey = AuthMeQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AuthMeQueryResponse, AuthMe401 | AuthMe403 | AuthMe500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authMeQueryKey();
    const query = useQuery({
        ...authMeQueryOptions(config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthMe401 | AuthMe403 | AuthMe500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}