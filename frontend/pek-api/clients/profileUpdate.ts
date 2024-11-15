import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { ProfileUpdateMutationRequest, ProfileUpdateMutationResponse, ProfileUpdatePathParams } from "../types/ProfileUpdate";

 /**
 * @link /api/v4/profile/:id
 */
export async function profileUpdate(id: ProfileUpdatePathParams["id"], data?: ProfileUpdateMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<ProfileUpdateMutationResponse>["data"]> {
    const res = await client<ProfileUpdateMutationResponse, ProfileUpdateMutationRequest>({ method: "patch", url: `/api/v4/profile/${id}`, data, ...options });
    return res.data;
}