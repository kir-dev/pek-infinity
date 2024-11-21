import client from "@kubb/plugin-client/client";
import type { GroupRemoveMutationResponse, GroupRemovePathParams, GroupRemove401, GroupRemove403, GroupRemove500 } from "../types/GroupRemove.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/group/:id}
 */
export async function groupRemove(id: GroupRemovePathParams["id"], config: Partial<RequestConfig> = {}) {
    const res = await client<GroupRemoveMutationResponse, GroupRemove401 | GroupRemove403 | GroupRemove500, unknown>({ method: "DELETE", url: `/api/v4/group/${id}`, ...config });
    return res.data;
}