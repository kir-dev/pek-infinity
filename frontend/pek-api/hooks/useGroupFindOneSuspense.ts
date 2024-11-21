import client from "@kubb/plugin-client/client";
import type { GroupFindOneQueryResponse, GroupFindOnePathParams, GroupFindOne401, GroupFindOne403, GroupFindOne500 } from "../types/GroupFindOne.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

 export const groupFindOneSuspenseQueryKey = (id: GroupFindOnePathParams["id"]) => [{ url: "/api/v4/group/:id", params: { id: id } }] as const;

 export type GroupFindOneSuspenseQueryKey = ReturnType<typeof groupFindOneSuspenseQueryKey>;

 /**
 * {@link /api/v4/group/:id}
 */
async function groupFindOne(id: GroupFindOnePathParams["id"], config: Partial<RequestConfig> = {}) {
    const res = await client<GroupFindOneQueryResponse, GroupFindOne401 | GroupFindOne403 | GroupFindOne500, unknown>({ method: "GET", url: `/api/v4/group/${id}`, ...config });
    return res.data;
}

 export function groupFindOneSuspenseQueryOptions(id: GroupFindOnePathParams["id"], config: Partial<RequestConfig> = {}) {
    const queryKey = groupFindOneSuspenseQueryKey(id);
    return queryOptions({
        enabled: !!(id),
        queryKey,
        queryFn: async ({ signal }) => {
            config.signal = signal;
            return groupFindOne(id, config);
        },
    });
}

 /**
 * {@link /api/v4/group/:id}
 */
export function useGroupFindOneSuspense<TData = GroupFindOneQueryResponse, TQueryData = GroupFindOneQueryResponse, TQueryKey extends QueryKey = GroupFindOneSuspenseQueryKey>(id: GroupFindOnePathParams["id"], options: {
    query?: Partial<UseSuspenseQueryOptions<GroupFindOneQueryResponse, GroupFindOne401 | GroupFindOne403 | GroupFindOne500, TData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindOneSuspenseQueryKey(id);
    const query = useSuspenseQuery({
        ...groupFindOneSuspenseQueryOptions(id, config) as unknown as UseSuspenseQueryOptions,
        queryKey,
        ...queryOptions as unknown as Omit<UseSuspenseQueryOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, GroupFindOne401 | GroupFindOne403 | GroupFindOne500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}