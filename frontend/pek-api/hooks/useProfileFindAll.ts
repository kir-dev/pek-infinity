import client from "@kubb/swagger-client/client";
import { useQuery, queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { ProfileFindAllQueryResponse } from "../types/ProfileFindAll";
import type { QueryObserverOptions, UseQueryResult, QueryKey, UseSuspenseQueryOptions, UseSuspenseQueryResult } from "@tanstack/react-query";

 type ProfileFindAllClient = typeof client<ProfileFindAllQueryResponse, never, never>;
type ProfileFindAll = {
    data: ProfileFindAllQueryResponse;
    error: never;
    request: never;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: ProfileFindAllQueryResponse;
    client: {
        parameters: Partial<Parameters<ProfileFindAllClient>[0]>;
        return: Awaited<ReturnType<ProfileFindAllClient>>;
    };
};
export const profileFindAllQueryKey = () => [{ url: "/api/v4/profile" }] as const;
export type ProfileFindAllQueryKey = ReturnType<typeof profileFindAllQueryKey>;
export function profileFindAllQueryOptions(options: ProfileFindAll["client"]["parameters"] = {}) {
    const queryKey = profileFindAllQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ProfileFindAll["data"], ProfileFindAll["error"]>({
                method: "get",
                url: `/api/v4/profile`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/profile
 */
export function useProfileFindAll<TData = ProfileFindAll["response"], TQueryData = ProfileFindAll["response"], TQueryKey extends QueryKey = ProfileFindAllQueryKey>(options: {
    query?: Partial<QueryObserverOptions<ProfileFindAll["response"], ProfileFindAll["error"], TData, TQueryData, TQueryKey>>;
    client?: ProfileFindAll["client"]["parameters"];
} = {}): UseQueryResult<TData, ProfileFindAll["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? profileFindAllQueryKey();
    const query = useQuery({
        ...profileFindAllQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseQueryResult<TData, ProfileFindAll["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}
export const profileFindAllSuspenseQueryKey = () => [{ url: "/api/v4/profile" }] as const;
export type ProfileFindAllSuspenseQueryKey = ReturnType<typeof profileFindAllSuspenseQueryKey>;
export function profileFindAllSuspenseQueryOptions(options: ProfileFindAll["client"]["parameters"] = {}) {
    const queryKey = profileFindAllSuspenseQueryKey();
    return queryOptions({
        queryKey,
        queryFn: async () => {
            const res = await client<ProfileFindAll["data"], ProfileFindAll["error"]>({
                method: "get",
                url: `/api/v4/profile`,
                ...options
            });
            return res.data;
        },
    });
}
/**
 * @link /api/v4/profile
 */
export function useProfileFindAllSuspense<TData = ProfileFindAll["response"], TQueryKey extends QueryKey = ProfileFindAllSuspenseQueryKey>(options: {
    query?: Partial<UseSuspenseQueryOptions<ProfileFindAll["response"], ProfileFindAll["error"], TData, TQueryKey>>;
    client?: ProfileFindAll["client"]["parameters"];
} = {}): UseSuspenseQueryResult<TData, ProfileFindAll["error"]> & {
    queryKey: TQueryKey;
} {
    const { query: queryOptions, client: clientOptions = {} } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? profileFindAllSuspenseQueryKey();
    const query = useSuspenseQuery({
        ...profileFindAllSuspenseQueryOptions(clientOptions) as unknown as QueryObserverOptions,
        queryKey,
        ...queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">
    }) as UseSuspenseQueryResult<TData, ProfileFindAll["error"]> & {
        queryKey: TQueryKey;
    };
    query.queryKey = queryKey as TQueryKey;
    return query;
}