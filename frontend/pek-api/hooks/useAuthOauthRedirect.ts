import client from "@kubb/plugin-client/client";
import type { AuthOauthRedirectQueryResponse, AuthOauthRedirectQueryParams, AuthOauthRedirect401, AuthOauthRedirect403, AuthOauthRedirect500 } from "../types/AuthOauthRedirect.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const authOauthRedirectQueryKey = (params: AuthOauthRedirectQueryParams) => [{ url: "/api/v4/auth/callback" }, ...(params ? [params] : [])] as const;

 export type AuthOauthRedirectQueryKey = ReturnType<typeof authOauthRedirectQueryKey>;

 /**
 * {@link /api/v4/auth/callback}
 */
async function authOauthRedirect(params: AuthOauthRedirectQueryParams, config: Partial<RequestConfig> = {}) {
    const res = await client<AuthOauthRedirectQueryResponse, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500, unknown>({ method: "GET", url: `/api/v4/auth/callback`, params, ...config });
    return res.data;
}

 export function authOauthRedirectQueryOptions(params: AuthOauthRedirectQueryParams, config: Partial<RequestConfig> = {}) {
    const queryKey = authOauthRedirectQueryKey(params);
    return queryOptions({
        enabled: !!(params),
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return authOauthRedirect(params, config);
        },
    });
}

 /**
 * {@link /api/v4/auth/callback}
 */
export function useAuthOauthRedirect<TData = AuthOauthRedirectQueryResponse, TQueryData = AuthOauthRedirectQueryResponse, TQueryKey extends QueryKey = AuthOauthRedirectQueryKey>(params: AuthOauthRedirectQueryParams, options: {
    query?: Partial<QueryObserverOptions<AuthOauthRedirectQueryResponse, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authOauthRedirectQueryKey(params);
    const query = useQuery({
        ...authOauthRedirectQueryOptions(params, config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}