import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { ProfileCreateMutationRequest, ProfileCreateMutationResponse } from "../types/ProfileCreate";

 /**
 * @link /api/v4/profile
 */
export async function profileCreate(data?: ProfileCreateMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<ProfileCreateMutationResponse>["data"]> {
    const res = await client<ProfileCreateMutationResponse, ProfileCreateMutationRequest>({ method: "post", url: `/api/v4/profile`, data, ...options });
    return res.data;
}