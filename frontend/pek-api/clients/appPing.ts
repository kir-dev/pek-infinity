import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { AppPingQueryResponse } from "../types/AppPing";

 /**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * @link /ping
 */
export async function appPing(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<AppPingQueryResponse>["data"]> {
    const res = await client<AppPingQueryResponse>({ method: "get", url: `/ping`, ...options });
    return res.data;
}