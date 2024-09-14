import type { UserDto } from "./UserDto";
import type { AxiosErrorDto } from "./AxiosErrorDto";

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
export type AuthMeQueryResponse = UserDto;
export type AuthMeQuery = {
    Response: AuthMeQueryResponse;
    Errors: AuthMe401 | AuthMe403 | AuthMe500;
};