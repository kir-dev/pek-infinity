import client from "@kubb/plugin-client/client";
import type { AuthOauthRedirectQueryResponse, AuthOauthRedirectQueryParams, AuthOauthRedirect401, AuthOauthRedirect403, AuthOauthRedirect500 } from "../types/AuthOauthRedirect.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const authOauthRedirectSuspenseQueryKey = (params: AuthOauthRedirectQueryParams) => [{ url: "/api/v4/auth/callback" }, ...(params ? [params] : [])] as const;

 export type AuthOauthRedirectSuspenseQueryKey = ReturnType<typeof authOauthRedirectSuspenseQueryKey>;

 /**
 * {@link /api/v4/auth/callback}
 */
async function authOauthRedirect(params: AuthOauthRedirectQueryParams, config: Partial<RequestConfig> = {}) {
    const res = await client<AuthOauthRedirectQueryResponse, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500, unknown>({ method: "GET", url: `/api/v4/auth/callback`, params, ...config });
    return res.data;
}

 export function authOauthRedirectSuspenseQueryOptions(params: AuthOauthRedirectQueryParams, config: Partial<RequestConfig> = {}) {
    const queryKey = authOauthRedirectSuspenseQueryKey(params);
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
export function useAuthOauthRedirectSuspense<TData = AuthOauthRedirectQueryResponse, TQueryData = AuthOauthRedirectQueryResponse, TQueryKey extends QueryKey = AuthOauthRedirectSuspenseQueryKey>(params: AuthOauthRedirectQueryParams, options: {
    query?: Partial<UseSuspenseQueryOptions<AuthOauthRedirectQueryResponse, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? authOauthRedirectSuspenseQueryKey(params);
    const query = useSuspenseQuery({
        ...authOauthRedirectSuspenseQueryOptions(params, config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}