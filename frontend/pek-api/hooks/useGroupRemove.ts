import client from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import type { GroupRemoveMutationResponse, GroupRemovePathParams, GroupRemove401, GroupRemove403, GroupRemove500 } from "../types/GroupRemove";
import type { UseMutationOptions } from "@tanstack/react-query";

 type GroupRemoveClient = typeof client<GroupRemoveMutationResponse, GroupRemove401 | GroupRemove403 | GroupRemove500, never>;
type GroupRemove = {
    data: GroupRemoveMutationResponse;
    error: GroupRemove401 | GroupRemove403 | GroupRemove500;
    request: never;
    pathParams: GroupRemovePathParams;
    queryParams: never;
    headerParams: never;
    response: GroupRemoveMutationResponse;
    client: {
        parameters: Partial<Parameters<GroupRemoveClient>[0]>;
        return: Awaited<ReturnType<GroupRemoveClient>>;
    };
};
/**
 * @link /api/v4/group/:id
 */
export function useGroupRemove(id: GroupRemovePathParams["id"], options: {
    mutation?: UseMutationOptions<GroupRemove["response"], GroupRemove["error"], GroupRemove["request"]>;
    client?: GroupRemove["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async () => {
            const res = await client<GroupRemove["data"], GroupRemove["error"], GroupRemove["request"]>({
                method: "delete",
                url: `/api/v4/group/${id}`,
                ...clientOptions
            });
            return res.data;
        },
        ...mutationOptions
    });
}