import client from "@kubb/plugin-client/client";
import type { GroupCreateMutationRequest, GroupCreateMutationResponse, GroupCreate401, GroupCreate403, GroupCreate500 } from "../types/GroupCreate.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

 export const groupCreateMutationKey = () => [{ "url": "/api/v4/group" }] as const;

 export type GroupCreateMutationKey = ReturnType<typeof groupCreateMutationKey>;

 /**
 * {@link /api/v4/group}
 */
async function groupCreate(data: GroupCreateMutationRequest, config: Partial<RequestConfig<GroupCreateMutationRequest>> = {}) {
    const res = await client<GroupCreateMutationResponse, GroupCreate401 | GroupCreate403 | GroupCreate500, GroupCreateMutationRequest>({ method: "POST", url: `/api/v4/group`, data, ...config });
    return res.data;
}

 /**
 * {@link /api/v4/group}
 */
export function useGroupCreate(options: {
    mutation?: UseMutationOptions<GroupCreateMutationResponse, GroupCreate401 | GroupCreate403 | GroupCreate500, {
        data: GroupCreateMutationRequest;
    }>;
    client?: Partial<RequestConfig<GroupCreateMutationRequest>>;
} = {}) {
    const { mutation: mutationOptions, client: config = {} } = options ?? {};
    const mutationKey = mutationOptions?.mutationKey ?? groupCreateMutationKey();
    return useMutation<GroupCreateMutationResponse, GroupCreate401 | GroupCreate403 | GroupCreate500, {
        data: GroupCreateMutationRequest;
    }>({
        mutationFn: async ({ data }) => {
            return groupCreate(data, config);
        },
        mutationKey,
        ...mutationOptions
    });
}