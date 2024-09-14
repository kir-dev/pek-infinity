import type { AxiosErrorDto } from "./AxiosErrorDto";

 export type AuthLogin200 = any;
/**
 * @description Redirects to the AuthSch login page.
*/
export type AuthLogin302 = any;
/**
 * @description Unauthorized
*/
export type AuthLogin401 = AxiosErrorDto;
/**
 * @description Forbidden
*/
export type AuthLogin403 = AxiosErrorDto;
/**
 * @description Internal Server Error
*/
export type AuthLogin500 = AxiosErrorDto;
export type AuthLoginQueryResponse = any;
export type AuthLoginQuery = {
    Response: AuthLoginQueryResponse;
    Errors: AuthLogin401 | AuthLogin403 | AuthLogin500;
};