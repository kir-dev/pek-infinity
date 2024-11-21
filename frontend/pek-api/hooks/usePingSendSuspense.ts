import client from "@kubb/plugin-client/client";
import type { PingSendQueryResponse, PingSend500 } from "../types/PingSend.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const pingSendSuspenseQueryKey = () => [{ url: "/api/v4/ping" }] as const;

 export type PingSendSuspenseQueryKey = ReturnType<typeof pingSendSuspenseQueryKey>;

 /**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * {@link /api/v4/ping}
 */
async function pingSend(config: Partial<RequestConfig> = {}) {
    const res = await client<PingSendQueryResponse, PingSend500, unknown>({ method: "GET", url: `/api/v4/ping`, ...config });
    return res.data;
}

 export function pingSendSuspenseQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = pingSendSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return pingSend(config);
        },
    });
}

 /**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * {@link /api/v4/ping}
 */
export function usePingSendSuspense<TData = PingSendQueryResponse, TQueryData = PingSendQueryResponse, TQueryKey extends QueryKey = PingSendSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<PingSendQueryResponse, PingSend500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? pingSendSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...pingSendSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, PingSend500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}