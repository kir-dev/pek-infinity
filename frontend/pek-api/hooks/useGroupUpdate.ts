import client from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import type { GroupUpdateMutationRequest, GroupUpdateMutationResponse, GroupUpdatePathParams, GroupUpdate401, GroupUpdate403, GroupUpdate500 } from "../types/GroupUpdate";
import type { UseMutationOptions } from "@tanstack/react-query";

 type GroupUpdateClient = typeof client<GroupUpdateMutationResponse, GroupUpdate401 | GroupUpdate403 | GroupUpdate500, GroupUpdateMutationRequest>;
type GroupUpdate = {
    data: GroupUpdateMutationResponse;
    error: GroupUpdate401 | GroupUpdate403 | GroupUpdate500;
    request: GroupUpdateMutationRequest;
    pathParams: GroupUpdatePathParams;
    queryParams: never;
    headerParams: never;
    response: GroupUpdateMutationResponse;
    client: {
        parameters: Partial<Parameters<GroupUpdateClient>[0]>;
        return: Awaited<ReturnType<GroupUpdateClient>>;
    };
};
/**
 * @link /api/v4/group/:id
 */
export function useGroupUpdate(id: GroupUpdatePathParams["id"], options: {
    mutation?: UseMutationOptions<GroupUpdate["response"], GroupUpdate["error"], GroupUpdate["request"]>;
    client?: GroupUpdate["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async (data) => {
            const res = await client<GroupUpdate["data"], GroupUpdate["error"], GroupUpdate["request"]>({
                method: "put",
                url: `/api/v4/group/${id}`,
                data,
                ...clientOptions
            });
            return res.data;
        },
        ...mutationOptions
    });
}