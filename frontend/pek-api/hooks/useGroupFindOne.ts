import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { GroupFindOneQueryResponse, GroupFindOnePathParams, GroupFindOne401, GroupFindOne403, GroupFindOne500 } from "../types/GroupFindOne";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type GroupFindOneClient = typeof client<GroupFindOneQueryResponse, GroupFindOne401 | GroupFindOne403 | GroupFindOne500, never>;
type GroupFindOne = {
    data: GroupFindOneQueryResponse;
    error: GroupFindOne401 | GroupFindOne403 | GroupFindOne500;
    request: never;
    pathParams: GroupFindOnePathParams;
    queryParams: never;
    headerParams: never;
    response: GroupFindOneQueryResponse;
    client: {
        parameters: Partial<Parameters<GroupFindOneClient>[0]>;
        return: Awaited<ReturnType<GroupFindOneClient>>;
    };
};
export const groupFindOneQueryKey = (id: GroupFindOnePathParams["id"]) => [{ url: "/api/v4/group/:id", params: { id: id } }] as const;
export type GroupFindOneQueryKey = ReturnType<typeof groupFindOneQueryKey>;
export function groupFindOneQueryOptions(id: GroupFindOnePathParams["id"], options: GroupFindOne["client"]["parameters"] = {}) {
    const queryKey = groupFindOneQueryKey(id);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GroupFindOne["data"], GroupFindOne["error"]>({
                method: "get",
                url: `/api/v4/group/${id}`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/group/:id
 */
export function useGroupFindOne<TData = GroupFindOne["response"], TQueryData = GroupFindOne["response"], TQueryKey extends QueryKey = GroupFindOneQueryKey>(id: GroupFindOnePathParams["id"], options: {
    query?: Partial<QueryObserverOptions<GroupFindOne["response"], GroupFindOne["error"], TData, TQueryData, TQueryKey>>;
    client?: GroupFindOne["client"]["parameters"];
} = {}): UseQueryResult<TData, GroupFindOne["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindOneQueryKey(id);
    const query = useQuery({
        ...groupFindOneQueryOptions(id, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, GroupFindOne["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const groupFindOneSuspenseQueryKey = (id: GroupFindOnePathParams["id"]) => [{ url: "/api/v4/group/:id", params: { id: id } }] as const;
export type GroupFindOneSuspenseQueryKey = ReturnType<typeof groupFindOneSuspenseQueryKey>;
export function groupFindOneSuspenseQueryOptions(id: GroupFindOnePathParams["id"], options: GroupFindOne["client"]["parameters"] = {}) {
    const queryKey = groupFindOneSuspenseQueryKey(id);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GroupFindOne["data"], GroupFindOne["error"]>({
                method: "get",
                url: `/api/v4/group/${id}`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/group/:id
 */
export function useGroupFindOneSuspense<TData = GroupFindOne["response"], TQueryKey extends QueryKey = GroupFindOneSuspenseQueryKey>(id: GroupFindOnePathParams["id"], options: {
    query?: Partial<UseSuspenseQueryOptions<GroupFindOne["response"], GroupFindOne["error"], TData, TQueryKey>>;
    client?: GroupFindOne["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, GroupFindOne["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindOneSuspenseQueryKey(id);
    const query = useSuspenseQuery({
        ...groupFindOneSuspenseQueryOptions(id, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, GroupFindOne["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}