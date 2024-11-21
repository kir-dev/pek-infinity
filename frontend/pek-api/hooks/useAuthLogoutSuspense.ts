import client from "@kubb/plugin-client/client";
import type { AuthLogoutQueryResponse, AuthLogout401, AuthLogout403, AuthLogout500 } from "../types/AuthLogout.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const authLogoutSuspenseQueryKey = () => [{ url: "/api/v4/auth/logout" }] as const;

 export type AuthLogoutSuspenseQueryKey = ReturnType<typeof authLogoutSuspenseQueryKey>;

 /**
 * {@link /api/v4/auth/logout}
 */
async function authLogout(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthLogoutQueryResponse, AuthLogout401 | AuthLogout403 | AuthLogout500, unknown>({ method: "GET", url: `/api/v4/auth/logout`, ...config });
    return res.data;
}

 export function authLogoutSuspenseQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = authLogoutSuspenseQueryKey();
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
export function useAuthLogoutSuspense<TData = AuthLogoutQueryResponse, TQueryData = AuthLogoutQueryResponse, TQueryKey extends QueryKey = AuthLogoutSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AuthLogoutQueryResponse, AuthLogout401 | AuthLogout403 | AuthLogout500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLogoutSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...authLogoutSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthLogout401 | AuthLogout403 | AuthLogout500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}