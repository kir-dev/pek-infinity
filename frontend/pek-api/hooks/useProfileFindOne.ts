import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { ProfileFindOneQueryResponse, ProfileFindOnePathParams } from "../types/ProfileFindOne";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type ProfileFindOneClient = typeof client<ProfileFindOneQueryResponse, never, never>;
type ProfileFindOne = {
    data: ProfileFindOneQueryResponse;
    error: never;
    request: never;
    pathParams: ProfileFindOnePathParams;
    queryParams: never;
    headerParams: never;
    response: ProfileFindOneQueryResponse;
    client: {
        parameters: Partial<Parameters<ProfileFindOneClient>[0]>;
        return: Awaited<ReturnType<ProfileFindOneClient>>;
    };
};
export const profileFindOneQueryKey = (id: ProfileFindOnePathParams["id"]) => [{ url: "/api/v4/profile/:id", params: { id: id } }] as const;
export type ProfileFindOneQueryKey = ReturnType<typeof profileFindOneQueryKey>;
export function profileFindOneQueryOptions(id: ProfileFindOnePathParams["id"], options: ProfileFindOne["client"]["parameters"] = {}) {
    const queryKey = profileFindOneQueryKey(id);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ProfileFindOne["data"], ProfileFindOne["error"]>({
                method: "get",
                url: `/api/v4/profile/${id}`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/profile/:id
 */
export function useProfileFindOne<TData = ProfileFindOne["response"], TQueryData = ProfileFindOne["response"], TQueryKey extends QueryKey = ProfileFindOneQueryKey>(id: ProfileFindOnePathParams["id"], options: {
    query?: Partial<QueryObserverOptions<ProfileFindOne["response"], ProfileFindOne["error"], TData, TQueryData, TQueryKey>>;
    client?: ProfileFindOne["client"]["parameters"];
} = {}): UseQueryResult<TData, ProfileFindOne["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? profileFindOneQueryKey(id);
    const query = useQuery({
        ...profileFindOneQueryOptions(id, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ProfileFindOne["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const profileFindOneSuspenseQueryKey = (id: ProfileFindOnePathParams["id"]) => [{ url: "/api/v4/profile/:id", params: { id: id } }] as const;
export type ProfileFindOneSuspenseQueryKey = ReturnType<typeof profileFindOneSuspenseQueryKey>;
export function profileFindOneSuspenseQueryOptions(id: ProfileFindOnePathParams["id"], options: ProfileFindOne["client"]["parameters"] = {}) {
    const queryKey = profileFindOneSuspenseQueryKey(id);
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ProfileFindOne["data"], ProfileFindOne["error"]>({
                method: "get",
                url: `/api/v4/profile/${id}`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/profile/:id
 */
export function useProfileFindOneSuspense<TData = ProfileFindOne["response"], TQueryKey extends QueryKey = ProfileFindOneSuspenseQueryKey>(id: ProfileFindOnePathParams["id"], options: {
    query?: Partial<UseSuspenseQueryOptions<ProfileFindOne["response"], ProfileFindOne["error"], TData, TQueryKey>>;
    client?: ProfileFindOne["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ProfileFindOne["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? profileFindOneSuspenseQueryKey(id);
    const query = useSuspenseQuery({
        ...profileFindOneSuspenseQueryOptions(id, clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ProfileFindOne["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}