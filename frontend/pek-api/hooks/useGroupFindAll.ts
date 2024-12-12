import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { GroupFindAllQueryResponse, GroupFindAllQueryParams, GroupFindAll401, GroupFindAll403, GroupFindAll500 } from "../types/GroupFindAll";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type GroupFindAllClient = typeof client<GroupFindAllQueryResponse, GroupFindAll401 | GroupFindAll403 | GroupFindAll500, never>;
type GroupFindAll = {
    data: GroupFindAllQueryResponse;
    error: GroupFindAll401 | GroupFindAll403 | GroupFindAll500;
    request: never;
    pathParams: never;
    queryParams: GroupFindAllQueryParams;
    headerParams: never;
    response: GroupFindAllQueryResponse;
    client: {
        parameters: Partial<Parameters<GroupFindAllClient>[0]>;
        return: Awaited<ReturnType<GroupFindAllClient>>;
    };
};
export const groupFindAllQueryKey = (params?: GroupFindAll["queryParams"]) => [{ url: "/api/v4/group" }, ...(params ? [params] : [])] as const;
export type GroupFindAllQueryKey = ReturnType<typeof groupFindAllQueryKey>;
export function groupFindAllQueryOptions(params?: GroupFindAll["queryParams"], options: GroupFindAll["client"]["parameters"] = {}) {
    const queryKey = groupFindAllQueryKey(params);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GroupFindAll["data"], GroupFindAll["error"]>({
                method: "get",
                url: `/api/v4/group`,
                params,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/group
 */
export function useGroupFindAll<TData = GroupFindAll["response"], TQueryData = GroupFindAll["response"], TQueryKey extends QueryKey = GroupFindAllQueryKey>(params?: GroupFindAll["queryParams"], options: {
    query?: Partial<QueryObserverOptions<GroupFindAll["response"], GroupFindAll["error"], TData, TQueryData, TQueryKey>>;
    client?: GroupFindAll["client"]["parameters"];
} = {}): UseQueryResult<TData, GroupFindAll["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindAllQueryKey(params);
    const query = useQuery({
        ...groupFindAllQueryOptions(params, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, GroupFindAll["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const groupFindAllSuspenseQueryKey = (params?: GroupFindAll["queryParams"]) => [{ url: "/api/v4/group" }, ...(params ? [params] : [])] as const;
export type GroupFindAllSuspenseQueryKey = ReturnType<typeof groupFindAllSuspenseQueryKey>;
export function groupFindAllSuspenseQueryOptions(params?: GroupFindAll["queryParams"], options: GroupFindAll["client"]["parameters"] = {}) {
    const queryKey = groupFindAllSuspenseQueryKey(params);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<GroupFindAll["data"], GroupFindAll["error"]>({
                method: "get",
                url: `/api/v4/group`,
                params,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/group
 */
export function useGroupFindAllSuspense<TData = GroupFindAll["response"], TQueryKey extends QueryKey = GroupFindAllSuspenseQueryKey>(params?: GroupFindAll["queryParams"], options: {
    query?: Partial<UseSuspenseQueryOptions<GroupFindAll["response"], GroupFindAll["error"], TData, TQueryKey>>;
    client?: GroupFindAll["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, GroupFindAll["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? groupFindAllSuspenseQueryKey(params);
    const query = useSuspenseQuery({
        ...groupFindAllSuspenseQueryOptions(params, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, GroupFindAll["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}