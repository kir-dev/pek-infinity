import type { Ping } from "./Ping";
import type { AxiosErrorDto } from "./AxiosErrorDto";

 export type PingSend200 = Ping;
/**
 * @description Internal Server Error
*/
export type PingSend500 = AxiosErrorDto;
export type PingSendQueryResponse = Ping;
export type PingSendQuery = {
    Response: PingSendQueryResponse;
    Errors: PingSend500;
};