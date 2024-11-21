import client from "@kubb/plugin-client/client";
import type { PingSendQueryResponse, PingSend500 } from "../types/PingSend.ts";
import type { RequestConfig } from "@kubb/plugin-client/client";

 /**
 * @description # Health check endpoint<br>This endpoint is a simple health check API designed to confirm that the server is operational.When accessed, it returns a straightforward response indicating that the service is up and running.
 * {@link /api/v4/ping}
 */
export async function pingSend(config: Partial<RequestConfig> = {}) {
    const res = await client<PingSendQueryResponse, PingSend500, unknown>({ method: "GET", url: `/api/v4/ping`, ...config });
    return res.data;
}