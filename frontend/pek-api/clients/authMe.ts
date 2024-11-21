import client from "@kubb/plugin-client/client";
import type { AuthMeQueryResponse, AuthMe401, AuthMe403, AuthMe500 } from "../types/AuthMe.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/auth/me}
 */
export async function authMe(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthMeQueryResponse, AuthMe401 | AuthMe403 | AuthMe500, unknown>({ method: "GET", url: `/api/v4/auth/me`, ...config });
    return res.data;
}