import type { AxiosErrorDto } from "./AxiosErrorDto.ts";
import type { Ping } from "./Ping.ts";

 export type PingSend200 = Ping;

 /**
 * @description Internal Server Error
*/
export type PingSend500 = AxiosErrorDto;

 export type PingSendQueryResponse = PingSend200;

 export type PingSendQuery = {
    Response: PingSend200;
    Errors: PingSend500;
};