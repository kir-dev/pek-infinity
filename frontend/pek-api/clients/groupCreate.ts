import client from "@kubb/plugin-client/client";
import type { GroupCreateMutationRequest, GroupCreateMutationResponse, GroupCreate401, GroupCreate403, GroupCreate500 } from "../types/GroupCreate.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/group}
 */
export async function groupCreate(data: GroupCreateMutationRequest, config: Partial<RequestConfig<GroupCreateMutationRequest>> = {}) {
    const res = await client<GroupCreateMutationResponse, GroupCreate401 | GroupCreate403 | GroupCreate500, GroupCreateMutationRequest>({ method: "POST", url: `/api/v4/group`, data, ...config });
    return res.data;
}