import client from "@kubb/plugin-client/client";
import type { GroupFindAllQueryResponse, GroupFindAllQueryParams, GroupFindAll401, GroupFindAll403, GroupFindAll500 } from "../types/GroupFindAll.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/group}
 */
export async function groupFindAll(params?: GroupFindAllQueryParams, config: Partial<RequestConfig> = {}) {
    const res = await client<GroupFindAllQueryResponse, GroupFindAll401 | GroupFindAll403 | GroupFindAll500, unknown>({ method: "GET", url: `/api/v4/group`, params, ...config });
    return res.data;
}