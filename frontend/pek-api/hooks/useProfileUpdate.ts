import client from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import type { ProfileUpdateMutationRequest, ProfileUpdateMutationResponse, ProfileUpdatePathParams } from "../types/ProfileUpdate";
import type { UseMutationOptions } from "@tanstack/react-query";

 type ProfileUpdateClient = typeof client<ProfileUpdateMutationResponse, never, ProfileUpdateMutationRequest>;
type ProfileUpdate = {
    data: ProfileUpdateMutationResponse;
    error: never;
    request: ProfileUpdateMutationRequest;
    pathParams: ProfileUpdatePathParams;
    queryParams: never;
    headerParams: never;
    response: ProfileUpdateMutationResponse;
    client: {
        parameters: Partial<Parameters<ProfileUpdateClient>[0]>;
        return: Awaited<ReturnType<ProfileUpdateClient>>;
    };
};
/**
 * @link /api/v4/profile/:id
 */
export function useProfileUpdate(id: ProfileUpdatePathParams["id"], options: {
    mutation?: UseMutationOptions<ProfileUpdate["response"], ProfileUpdate["error"], ProfileUpdate["request"]>;
    client?: ProfileUpdate["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async (data) => {
            const res = await client<ProfileUpdate["data"], ProfileUpdate["error"], ProfileUpdate["request"]>({
                method: "patch",
                url: `/api/v4/profile/${id}`,
                data,
                ...clientOptions
            });
            return res.data;
        },
        ...mutationOptions
    });
}