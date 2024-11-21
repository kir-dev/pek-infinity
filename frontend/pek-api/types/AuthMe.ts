import type { AxiosErrorDto } from "./AxiosErrorDto.ts";
import type { UserDto } from "./UserDto.ts";

 export type AuthMe200 = UserDto;

 /**
 * @description Unauthorized
*/
export type AuthMe401 = AxiosErrorDto;

 /**
 * @description Forbidden
*/
export type AuthMe403 = AxiosErrorDto;

 /**
 * @description Internal Server Error
*/
export type AuthMe500 = AxiosErrorDto;

 export type AuthMeQueryResponse = AuthMe200;

 export type AuthMeQuery = {
    Response: AuthMe200;
    Errors: AuthMe401 | AuthMe403 | AuthMe500;
};