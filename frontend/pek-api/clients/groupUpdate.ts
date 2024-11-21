import client from "@kubb/plugin-client/client";
import type { GroupUpdateMutationRequest, GroupUpdateMutationResponse, GroupUpdatePathParams, GroupUpdate401, GroupUpdate403, GroupUpdate500 } from "../types/GroupUpdate.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/group/:id}
 */
export async function groupUpdate(id: GroupUpdatePathParams["id"], data?: GroupUpdateMutationRequest, config: Partial<RequestConfig<GroupUpdateMutationRequest>> = {}) {
    const res = await client<GroupUpdateMutationResponse, GroupUpdate401 | GroupUpdate403 | GroupUpdate500, GroupUpdateMutationRequest>({ method: "PUT", url: `/api/v4/group/${id}`, data, ...config });
    return res.data;
}