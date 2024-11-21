import type { AxiosErrorDto } from "./AxiosErrorDto.ts";

 export type AuthOauthRedirectQueryParams = {
    code: any;
};

 export type AuthOauthRedirect200 = any;

 /**
 * @description Redirects to the frontend and sets cookie with JWT.
*/
export type AuthOauthRedirect302 = any;

 /**
 * @description Unauthorized
*/
export type AuthOauthRedirect401 = AxiosErrorDto;

 /**
 * @description Forbidden
*/
export type AuthOauthRedirect403 = AxiosErrorDto;

 /**
 * @description Internal Server Error
*/
export type AuthOauthRedirect500 = AxiosErrorDto;

 export type AuthOauthRedirectQueryResponse = AuthOauthRedirect200;

 export type AuthOauthRedirectQuery = {
    Response: AuthOauthRedirect200;
    QueryParams: AuthOauthRedirectQueryParams;
    Errors: AuthOauthRedirect401 | AuthOauthRedirect403 | AuthOauthRedirect500;
};