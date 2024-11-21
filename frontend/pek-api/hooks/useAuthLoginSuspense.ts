import client from "@kubb/plugin-client/client";
import type { AuthLoginQueryResponse, AuthLogin401, AuthLogin403, AuthLogin500 } from "../types/AuthLogin.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const authLoginSuspenseQueryKey = () => [{ url: "/api/v4/auth/login" }] as const;

 export type AuthLoginSuspenseQueryKey = ReturnType<typeof authLoginSuspenseQueryKey>;

 /**
 * {@link /api/v4/auth/login}
 */
async function authLogin(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthLoginQueryResponse, AuthLogin401 | AuthLogin403 | AuthLogin500, unknown>({ method: "GET", url: `/api/v4/auth/login`, ...config });
    return res.data;
}

 export function authLoginSuspenseQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = authLoginSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return authLogin(config);
        },
    });
}

 /**
 * {@link /api/v4/auth/login}
 */
export function useAuthLoginSuspense<TData = AuthLoginQueryResponse, TQueryData = AuthLoginQueryResponse, TQueryKey extends QueryKey = AuthLoginSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<AuthLoginQueryResponse, AuthLogin401 | AuthLogin403 | AuthLogin500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLoginSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...authLoginSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthLogin401 | AuthLogin403 | AuthLogin500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}