import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { GroupCreateMutationRequest, GroupCreateMutationResponse } from "../types/GroupCreate";

 /**
 * @link /api/v4/group
 */
export async function groupCreate(data: GroupCreateMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GroupCreateMutationResponse>["data"]> {
    const res = await client<GroupCreateMutationResponse, GroupCreateMutationRequest>({ method: "post", url: `/api/v4/group`, data, ...options });
    return res.data;
}