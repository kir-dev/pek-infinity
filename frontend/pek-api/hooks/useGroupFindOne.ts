import client from "@kubb/plugin-client/client";
import type { GroupFindOneQueryResponse, GroupFindOnePathParams, GroupFindOne401, GroupFindOne403, GroupFindOne500 } from "../types/GroupFindOne.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { QueryKey, QueryObserverOptions, UseQueryResult } from "@tanstack/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

 export const groupFindOneQueryKey = (id: GroupFindOnePathParams["id"]) => [{ url: "/api/v4/group/:id", params: { id: id } }] as const;

 export type GroupFindOneQueryKey = ReturnType<typeof groupFindOneQueryKey>;

 /**
 * {@link /api/v4/group/:id}
 */
async function groupFindOne(id: GroupFindOnePathParams["id"], config: Partial<RequestConfig> = {}) {
    const res = await client<GroupFindOneQueryResponse, GroupFindOne401 | GroupFindOne403 | GroupFindOne500, unknown>({ method: "GET", url: `/api/v4/group/${id}`, ...config });
    return res.data;
}

 export function groupFindOneQueryOptions(id: GroupFindOnePathParams["id"], config: Partial<RequestConfig> = {}) {
    const queryKey = groupFindOneQueryKey(id);
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
export function useGroupFindOne<TData = GroupFindOneQueryResponse, TQueryData = GroupFindOneQueryResponse, TQueryKey extends QueryKey = GroupFindOneQueryKey>(id: GroupFindOnePathParams["id"], options: {
    query?: Partial<QueryObserverOptions<GroupFindOneQueryResponse, GroupFindOne401 | GroupFindOne403 | GroupFindOne500, TData, TQueryData, TQueryKey>>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { query: queryOptions, client: config = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindOneQueryKey(id);
    const query = useQuery({
        ...groupFindOneQueryOptions(id, config) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, GroupFindOne401 | GroupFindOne403 | GroupFindOne500> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}