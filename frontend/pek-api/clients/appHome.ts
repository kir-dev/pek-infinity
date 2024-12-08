import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { AppHomeQueryResponse } from "../types/AppHome";

 /**
 * @link /
 */
export async function appHome(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AppHomeQueryResponse>["data"]> {
    const res = await client<AppHomeQueryResponse>({ method: "get", url: `/`, ...options });
    return res.data;
}