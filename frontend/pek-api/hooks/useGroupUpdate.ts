import client from "@kubb/plugin-client/client";
import type { GroupUpdateMutationRequest, GroupUpdateMutationResponse, GroupUpdatePathParams, GroupUpdate401, GroupUpdate403, GroupUpdate500 } from "../types/GroupUpdate.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

 export const groupUpdateMutationKey = () => [{ "url": "/api/v4/group/{id}" }] as const;

 export type GroupUpdateMutationKey = ReturnType<typeof groupUpdateMutationKey>;

 /**
 * {@link /api/v4/group/:id}
 */
async function groupUpdate(id: GroupUpdatePathParams["id"], data?: GroupUpdateMutationRequest, config: Partial<RequestConfig<GroupUpdateMutationRequest>> = {}) {
    const res = await client<GroupUpdateMutationResponse, GroupUpdate401 | GroupUpdate403 | GroupUpdate500, GroupUpdateMutationRequest>({ method: "PUT", url: `/api/v4/group/${id}`, data, ...config });
    return res.data;
}

 /**
 * {@link /api/v4/group/:id}
 */
export function useGroupUpdate(options: {
    mutation?: UseMutationOptions<GroupUpdateMutationResponse, GroupUpdate401 | GroupUpdate403 | GroupUpdate500, {
        id: GroupUpdatePathParams["id"];
        data?: GroupUpdateMutationRequest;
    }>;
    client?: Partial<RequestConfig<GroupUpdateMutationRequest>>;
} = {}) {
    const { mutation: mutationOptions, client: config = {} } = options ?? {};
    const mutationKey = mutationOptions?.mutationKey ?? groupUpdateMutationKey();
    return useMutation<GroupUpdateMutationResponse, GroupUpdate401 | GroupUpdate403 | GroupUpdate500, {
        id: GroupUpdatePathParams["id"];
        data?: GroupUpdateMutationRequest;
    }>({
        mutationFn: async ({ id, data }) => {
            return groupUpdate(id, data, config);
        },
        mutationKey,
        ...mutationOptions
    });
}