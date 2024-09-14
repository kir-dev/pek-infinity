import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { AuthLoginQueryResponse } from "../types/AuthLogin";

 /**
 * @link /api/v4/auth/login
 */
export async function authLogin(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AuthLoginQueryResponse>["data"]> {
    const res = await client<AuthLoginQueryResponse>({ method: "get", url: `/api/v4/auth/login`, ...options });
    return res.data;
}