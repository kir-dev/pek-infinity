import client from "@kubb/plugin-client/client";
import type { AuthLoginQueryResponse, AuthLogin401, AuthLogin403, AuthLogin500 } from "../types/AuthLogin.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/auth/login}
 */
export async function authLogin(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthLoginQueryResponse, AuthLogin401 | AuthLogin403 | AuthLogin500, unknown>({ method: "GET", url: `/api/v4/auth/login`, ...config });
    return res.data;
}