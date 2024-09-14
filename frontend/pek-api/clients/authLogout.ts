import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { AuthLogoutQueryResponse } from "../types/AuthLogout";

 /**
 * @link /api/v4/auth/logout
 */
export async function authLogout(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AuthLogoutQueryResponse>["data"]> {
    const res = await client<AuthLogoutQueryResponse>({ method: "get", url: `/api/v4/auth/logout`, ...options });
    return res.data;
}