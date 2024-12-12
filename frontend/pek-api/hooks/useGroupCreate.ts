import client from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import type { GroupCreateMutationRequest, GroupCreateMutationResponse, GroupCreate401, GroupCreate403, GroupCreate500 } from "../types/GroupCreate";
import type { UseMutationOptions } from "@tanstack/react-query";

 type GroupCreateClient = typeof client<GroupCreateMutationResponse, GroupCreate401 | GroupCreate403 | GroupCreate500, GroupCreateMutationRequest>;
type GroupCreate = {
    data: GroupCreateMutationResponse;
    error: GroupCreate401 | GroupCreate403 | GroupCreate500;
    request: GroupCreateMutationRequest;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: GroupCreateMutationResponse;
    client: {
        parameters: Partial<Parameters<GroupCreateClient>[0]>;
        return: Awaited<ReturnType<GroupCreateClient>>;
    };
};
/**
 * @link /api/v4/group
 */
export function useGroupCreate(options: {
    mutation?: UseMutationOptions<GroupCreate["response"], GroupCreate["error"], GroupCreate["request"]>;
    client?: GroupCreate["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async (data) => {
            const res = await client<GroupCreate["data"], GroupCreate["error"], GroupCreate["request"]>({
                method: "post",
                url: `/api/v4/group`,
                data,
                ...clientOptions
            });
            return res.data;
        },
        ...mutationOptions
    });
}