import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { ProfileFindOneQueryResponse, ProfileFindOnePathParams } from "../types/ProfileFindOne";

 /**
 * @link /api/v4/profile/:id
 */
export async function profileFindOne(id: ProfileFindOnePathParams["id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<ProfileFindOneQueryResponse>["data"]> {
    const res = await client<ProfileFindOneQueryResponse>({ method: "get", url: `/api/v4/profile/${id}`, ...options });
    return res.data;
}