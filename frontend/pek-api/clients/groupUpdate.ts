import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { GroupUpdateMutationRequest, GroupUpdateMutationResponse, GroupUpdatePathParams } from "../types/GroupUpdate";

 /**
 * @link /api/v4/group/:id
 */
export async function groupUpdate(id: GroupUpdatePathParams["id"], data?: GroupUpdateMutationRequest, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GroupUpdateMutationResponse>["data"]> {
    const res = await client<GroupUpdateMutationResponse, GroupUpdateMutationRequest>({ method: "put", url: `/api/v4/group/${id}`, data, ...options });
    return res.data;
}