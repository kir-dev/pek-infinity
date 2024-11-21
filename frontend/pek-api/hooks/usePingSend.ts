import client from "@kubb/plugin-client/client";
import type { PingSendQueryResponse, PingSend500 } from "../types/PingSend.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const pingSendQueryKey = () => [{ url: "/api/v4/ping" }] as const;

 export type PingSendQueryKey = ReturnType<typeof pingSendQueryKey>;

 /**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * {@link /api/v4/ping}
 */
async function pingSend(config: Partial<RequestConfig> = {}) {
    const res = await client<PingSendQueryResponse, PingSend500, unknown>({ method: "GET", url: `/api/v4/ping`, ...config });
    return res.data;
}

 export function pingSendQueryOptions(config: Partial<RequestConfig> = {}) {
    const queryKey = pingSendQueryKey();
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
export function usePingSend<TData = PingSendQueryResponse, TQueryData = PingSendQueryResponse, TQueryKey extends QueryKey = PingSendQueryKey>(options: {
    query?: Partial<QueryObserverOptions<PingSendQueryResponse, PingSend500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? pingSendQueryKey();
    const query = useQuery({
        ...pingSendQueryOptions(config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, PingSend500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}