import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { GroupFindAllQueryResponse, GroupFindAllQueryParams } from "../types/GroupFindAll";

 /**
 * @link /api/v4/group
 */
export async function groupFindAll(params?: GroupFindAllQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GroupFindAllQueryResponse>["data"]> {
    const res = await client<GroupFindAllQueryResponse>({ method: "get", url: `/api/v4/group`, params, ...options });
    return res.data;
}