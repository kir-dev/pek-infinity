import client from "@kubb/plugin-client/client";
import type { GroupFindAllQueryResponse, GroupFindAllQueryParams, GroupFindAll401, GroupFindAll403, GroupFindAll500 } from "../types/GroupFindAll.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const groupFindAllQueryKey = (params?: GroupFindAllQueryParams) => [{ url: "/api/v4/group" }, ...(params ? [params] : [])] as const;

 export type GroupFindAllQueryKey = ReturnType<typeof groupFindAllQueryKey>;

 /**
 * {@link /api/v4/group}
 */
async function groupFindAll(params?: GroupFindAllQueryParams, config: Partial<RequestConfig> = {}) {
    const res = await client<GroupFindAllQueryResponse, GroupFindAll401 | GroupFindAll403 | GroupFindAll500, unknown>({ method: "GET", url: `/api/v4/group`, params, ...config });
    return res.data;
}

 export function groupFindAllQueryOptions(params?: GroupFindAllQueryParams, config: Partial<RequestConfig> = {}) {
    const queryKey = groupFindAllQueryKey(params);
    return queryOptions({
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return groupFindAll(params, config);
        },
    });
}

 /**
 * {@link /api/v4/group}
 */
export function useGroupFindAll<TData = GroupFindAllQueryResponse, TQueryData = GroupFindAllQueryResponse, TQueryKey extends QueryKey = GroupFindAllQueryKey>(params?: GroupFindAllQueryParams, options: {
    query?: Partial<QueryObserverOptions<GroupFindAllQueryResponse, GroupFindAll401 | GroupFindAll403 | GroupFindAll500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindAllQueryKey(params);
    const query = useQuery({
        ...groupFindAllQueryOptions(params, config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, GroupFindAll401 | GroupFindAll403 | GroupFindAll500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}