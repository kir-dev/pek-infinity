import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { GroupRemoveMutationResponse, GroupRemovePathParams } from "../types/GroupRemove";

 /**
 * @link /api/v4/group/:id
 */
export async function groupRemove(id: GroupRemovePathParams["id"], options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<GroupRemoveMutationResponse>["data"]> {
    const res = await client<GroupRemoveMutationResponse>({ method: "delete", url: `/api/v4/group/${id}`, ...options });
    return res.data;
}