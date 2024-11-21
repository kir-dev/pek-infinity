import client from "@kubb/plugin-client/client";
import type { AuthLoginQueryResponse, AuthLogin401, AuthLogin403, AuthLogin500 } from "../types/AuthLogin.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const authLoginQueryKey = () => [{ url: "/api/v4/auth/login" }] as const;

 export type AuthLoginQueryKey = ReturnType<typeof authLoginQueryKey>;

 /**
 * {@link /api/v4/auth/login}
 */
async function authLogin(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthLoginQueryResponse, AuthLogin401 | AuthLogin403 | AuthLogin500, unknown>({ method: "GET", url: `/api/v4/auth/login`, ...config });
    return res.data;
}

 export function authLoginQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = authLoginQueryKey();
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
export function useAuthLogin<TData = AuthLoginQueryResponse, TQueryData = AuthLoginQueryResponse, TQueryKey extends QueryKey = AuthLoginQueryKey>(options: {
    query?: Partial<QueryObserverOptions<AuthLoginQueryResponse, AuthLogin401 | AuthLogin403 | AuthLogin500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authLoginQueryKey();
    const query = useQuery({
        ...authLoginQueryOptions(config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthLogin401 | AuthLogin403 | AuthLogin500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}