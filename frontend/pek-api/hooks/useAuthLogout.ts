import client from "@kubb/plugin-client/client";
import type { AuthLogoutQueryResponse, AuthLogout401, AuthLogout403, AuthLogout500 } from "../types/AuthLogout.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const authLogoutQueryKey = () => [{ url: "/api/v4/auth/logout" }] as const;

 export type AuthLogoutQueryKey = ReturnType<typeof authLogoutQueryKey>;

 /**
 * {@link /api/v4/auth/logout}
 */
async function authLogout(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthLogoutQueryResponse, AuthLogout401 | AuthLogout403 | AuthLogout500, unknown>({ method: "GET", url: `/api/v4/auth/logout`, ...config });
    return res.data;
}

 export function authLogoutQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = authLogoutQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return authLogout(config);
        },
    });
}

 /**
 * {@link /api/v4/auth/logout}
 */
export function useAuthLogout<TData = AuthLogoutQueryResponse, TQueryData = AuthLogoutQueryResponse, TQueryKey extends QueryKey = AuthLogoutQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AuthLogoutQueryResponse, AuthLogout401 | AuthLogout403 | AuthLogout500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLogoutQueryKey();
    const query = useQuery({
        ...authLogoutQueryOptions(config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthLogout401 | AuthLogout403 | AuthLogout500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}