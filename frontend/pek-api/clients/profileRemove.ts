import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { ProfileRemoveMutationResponse, ProfileRemovePathParams } from "../types/ProfileRemove";

 /**
 * @link /api/v4/profile/:id
 */
export async function profileRemove(id: ProfileRemovePathParams["id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<ProfileRemoveMutationResponse>["data"]> {
    const res = await client<ProfileRemoveMutationResponse>({ method: "delete", url: `/api/v4/profile/${id}`, ...options });
    return res.data;
}