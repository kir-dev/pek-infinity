import client from "@kubb/swagger-client/client";
import type { ResponseConfig } from "@kubb/swagger-client/client";
import type { PingSendQueryResponse } from "../types/PingSend";

 /**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * @link /api/v4/ping
 */
export async function pingSend(options: Partial<Parameters<typeof client>[0]> = {}): Promise<ResponseConfig<PingSendQueryResponse>["data"]> {
    const res = await client<PingSendQueryResponse>({ method: "get", url: `/api/v4/ping`, ...options });
    return res.data;
}