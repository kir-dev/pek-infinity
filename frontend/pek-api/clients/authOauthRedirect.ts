import client from "@kubb/plugin-client/client";
import type { AuthOauthRedirectQueryResponse, AuthOauthRedirectQueryParams, AuthOauthRedirect401, AuthOauthRedirect403, AuthOauthRedirect500 } from "../types/AuthOauthRedirect.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * {@link /api/v4/auth/callback}
 */
export async function authOauthRedirect(params: AuthOauthRedirectQueryParams, config: Partial<RequestConfig> = {}) {
    const res = await client<AuthOauthRedirectQueryResponse, AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500, unknown>({ method: "GET", url: `/api/v4/auth/callback`, params, ...config });
    return res.data;
}