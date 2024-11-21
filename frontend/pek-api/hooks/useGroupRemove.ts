import client from "@kubb/plugin-client/client";
import type { GroupRemoveMutationResponse, GroupRemovePathParams, GroupRemove401, GroupRemove403, GroupRemove500 } from "../types/GroupRemove.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

 export const groupRemoveMutationKey = () => [{ "url": "/api/v4/group/{id}" }] as const;

 export type GroupRemoveMutationKey = ReturnType<typeof groupRemoveMutationKey>;

 /**
 * {@link /api/v4/group/:id}
 */
async function groupRemove(id: GroupRemovePathParams["id"], config: Partial<RequestConfig> = {}) {
    const res = await client<GroupRemoveMutationResponse, GroupRemove401 | GroupRemove403 | GroupRemove500, unknown>({ method: "DELETE", url: `/api/v4/group/${id}`, ...config });
    return res.data;
}

 /**
 * {@link /api/v4/group/:id}
 */
export function useGroupRemove(options: {
    mutation?: UseMutationOptions<GroupRemoveMutationResponse, GroupRemove401 | GroupRemove403 | GroupRemove500, {
        id: GroupRemovePathParams["id"];
    }>;
    client?: Partial<RequestConfig>;
} = {}) {
    const { mutation: mutationOptions, client: config = {} } = options ?? {};
    const mutationKey = mutationOptions?.mutationKey ?? groupRemoveMutationKey();
    return useMutation<GroupRemoveMutationResponse, GroupRemove401 | GroupRemove403 | GroupRemove500, {
        id: GroupRemovePathParams["id"];
    }>({
        mutationFn: async ({ id }) => {
            return groupRemove(id, config);
        },
        mutationKey,
        ...mutationOptions
    });
}