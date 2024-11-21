import type { AxiosErrorDto } from "./AxiosErrorDto.ts";

 export type AuthLogout200 = any;

 /**
 * @description Redirects to the frontend and clears the JWT cookie.
*/
export type AuthLogout302 = any;

 /**
 * @description Unauthorized
*/
export type AuthLogout401 = AxiosErrorDto;

 /**
 * @description Forbidden
*/
export type AuthLogout403 = AxiosErrorDto;

 /**
 * @description Internal Server Error
*/
export type AuthLogout500 = AxiosErrorDto;

 export type AuthLogoutQueryResponse = AuthLogout200;

 export type AuthLogoutQuery = {
    Response: AuthLogout200;
    Errors: AuthLogout401 | AuthLogout403 | AuthLogout500;
};