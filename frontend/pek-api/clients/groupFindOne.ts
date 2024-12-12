import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { GroupFindOneQueryResponse, GroupFindOnePathParams } from "../types/GroupFindOne";

 /**
 * @link /api/v4/group/:id
 */
export async function groupFindOne(id: GroupFindOnePathParams["id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GroupFindOneQueryResponse>["data"]> {
    const res = await client<GroupFindOneQueryResponse>({ method: "get", url: `/api/v4/group/${id}`, ...options });
    return res.data;
}