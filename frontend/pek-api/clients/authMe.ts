import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { AuthMeQueryResponse } from "../types/AuthMe";

 /**
 * @link /api/v4/auth/me
 */
export async function authMe(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AuthMeQueryResponse>["data"]> {
    const res = await client<AuthMeQueryResponse>({ method: "get", url: `/api/v4/auth/me`, ...options });
    return res.data;
}