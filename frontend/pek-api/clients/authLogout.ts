import client from "@kubb/plugin-client/client";
import type { AuthLogoutQueryResponse, AuthLogout401, AuthLogout403, AuthLogout500 } from "../types/AuthLogout.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/auth/logout}
 */
export async function authLogout(config: Partial<RequestConfig> = {}) {
    const res = await client<AuthLogoutQueryResponse, AuthLogout401 | AuthLogout403 | AuthLogout500, unknown>({ method: "GET", url: `/api/v4/auth/logout`, ...config });
    return res.data;
}