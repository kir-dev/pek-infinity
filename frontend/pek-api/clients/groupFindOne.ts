import client from "@kubb/plugin-client/client";
import type { GroupFindOneQueryResponse, GroupFindOnePathParams, GroupFindOne401, GroupFindOne403, GroupFindOne500 } from "../types/GroupFindOne.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/group/:id}
 */
export async function groupFindOne(id: GroupFindOnePathParams["id"], config: Partial<RequestConfig> = {}) {
    const res = await client<GroupFindOneQueryResponse, GroupFindOne401 | GroupFindOne403 | GroupFindOne500, unknown>({ method: "GET", url: `/api/v4/group/${id}`, ...config });
    return res.data;
}