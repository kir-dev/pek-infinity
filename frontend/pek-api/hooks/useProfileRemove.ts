import client from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import type { ProfileRemoveMutationResponse, ProfileRemovePathParams } from "../types/ProfileRemove";
import type { UseMutationOptions } from "@tanstack/react-query";

 type ProfileRemoveClient = typeof client<ProfileRemoveMutationResponse, never, never>;
type ProfileRemove = {
    data: ProfileRemoveMutationResponse;
    error: never;
    request: never;
    pathParams: ProfileRemovePathParams;
    queryParams: never;
    headerParams: never;
    response: ProfileRemoveMutationResponse;
    client: {
        parameters: Partial<Parameters<ProfileRemoveClient>[0]>;
        return: Awaited<ReturnType<ProfileRemoveClient>>;
    };
};
/**
 * @link /api/v4/profile/:id
 */
export function useProfileRemove(id: ProfileRemovePathParams["id"], options: {
    mutation?: UseMutationOptions<ProfileRemove["response"], ProfileRemove["error"], ProfileRemove["request"]>;
    client?: ProfileRemove["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async () => {
            const res = await client<ProfileRemove["data"], ProfileRemove["error"], ProfileRemove["request"]>({
                method: "delete",
                url: `/api/v4/profile/${id}`,
                ...clientOptions
            });
            return res.data;
        },
        ...mutationOptions
    });
}