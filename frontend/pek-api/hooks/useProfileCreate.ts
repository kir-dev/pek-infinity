import client from "@kubb/swagger-client/client";
import { useMutation } from "@tanstack/react-query";
import type { ProfileCreateMutationRequest, ProfileCreateMutationResponse } from "../types/ProfileCreate";
import type { UseMutationOptions } from "@tanstack/react-query";

 type ProfileCreateClient = typeof client<ProfileCreateMutationResponse, never, ProfileCreateMutationRequest>;
type ProfileCreate = {
    data: ProfileCreateMutationResponse;
    error: never;
    request: ProfileCreateMutationRequest;
    pathParams: never;
    queryParams: never;
    headerParams: never;
    response: ProfileCreateMutationResponse;
    client: {
        parameters: Partial<Parameters<ProfileCreateClient>[0]>;
        return: Awaited<ReturnType<ProfileCreateClient>>;
    };
};
/**
 * @link /api/v4/profile
 */
export function useProfileCreate(options: {
    mutation?: UseMutationOptions<ProfileCreate["response"], ProfileCreate["error"], ProfileCreate["request"]>;
    client?: ProfileCreate["client"]["parameters"];
} = {}) {
    const { mutation: mutationOptions, client: clientOptions = {} } = options ?? {};
    return useMutation({
        mutationFn: async (data) => {
            const res = await client<ProfileCreate["data"], ProfileCreate["error"], ProfileCreate["request"]>({
                method: "post",
                url: `/api/v4/profile`,
                data,
                ...clientOptions
            });
            return res.data;
        },
        ...mutationOptions
    });
}