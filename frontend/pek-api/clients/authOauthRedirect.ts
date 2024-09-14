import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { AuthOauthRedirectQueryResponse, AuthOauthRedirectQueryParams } from "../types/AuthOauthRedirect";

 /**
 * @link /api/v4/auth/callback
 */
export async function authOauthRedirect(params: AuthOauthRedirectQueryParams, options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AuthOauthRedirectQueryResponse>["data"]> {
    const res = await client<AuthOauthRedirectQueryResponse>({ method: "get", url: `/api/v4/auth/callback`, params, ...options });
    return res.data;
}