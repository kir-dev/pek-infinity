import client from "@kubb/plugin-client/client";
import type { GroupFindAllQueryResponse, GroupFindAllQueryParams, GroupFindAll401, GroupFindAll403, GroupFindAll500 } from "../types/GroupFindAll.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const groupFindAllSuspenseQueryKey = (params?: GroupFindAllQueryParams) => [{ url: "/api/v4/group" }, ...(params ? [params] : [])] as const;

 export type GroupFindAllSuspenseQueryKey = ReturnType<typeof groupFindAllSuspenseQueryKey>;

 /**
 * {@link /api/v4/group}
 */
async function groupFindAll(params?: GroupFindAllQueryParams, config: Partial<RequestConfig> = {}) {
    const res = await client<GroupFindAllQueryResponse, GroupFindAll401 | GroupFindAll403 | GroupFindAll500, unknown>({ method: "GET", url: `/api/v4/group`, params, ...config });
    return res.data;
}

 export function groupFindAllSuspenseQueryOptions(params?: GroupFindAllQueryParams, config: Partial<RequestConfig> = {}) {
    const queryKey = groupFindAllSuspenseQueryKey(params);
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
export function useGroupFindAllSuspense<TData = GroupFindAllQueryResponse, TQueryData = GroupFindAllQueryResponse, TQueryKey extends QueryKey = GroupFindAllSuspenseQueryKey>(params?: GroupFindAllQueryParams, options: {
    query?: Partial<UseSuspenseQueryOptions<GroupFindAllQueryResponse, GroupFindAll401 | GroupFindAll403 | GroupFindAll500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindAllSuspenseQueryKey(params);
    const query = useSuspenseQuery({
        ...groupFindAllSuspenseQueryOptions(params, config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, GroupFindAll401 | GroupFindAll403 | GroupFindAll500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}