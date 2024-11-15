import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { ProfileFindAllQueryResponse } from "../types/ProfileFindAll";

 /**
 * @link /api/v4/profile
 */
export async function profileFindAll(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<ProfileFindAllQueryResponse>["data"]> {
    const res = await client<ProfileFindAllQueryResponse>({ method: "get", url: `/api/v4/profile`, ...options });
    return res.data;
}