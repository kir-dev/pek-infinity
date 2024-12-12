import type { AxiosErrorDto } from "./AxiosErrorDto";

 export type GroupRemovePathParams = {
    /**
     * @type string
    */
    id: string;
};
export type GroupRemove200 = any;
/**
 * @description Delete group
*/
export type GroupRemove204 = any;
/**
 * @description Unauthorized
*/
export type GroupRemove401 = AxiosErrorDto;
/**
 * @description Forbidden
*/
export type GroupRemove403 = AxiosErrorDto;
/**
 * @description Internal Server Error
*/
export type GroupRemove500 = AxiosErrorDto;
export type GroupRemoveMutationResponse = any;
export type GroupRemoveMutation = {
    Response: GroupRemoveMutationResponse;
    PathParams: GroupRemovePathParams;
    Errors: GroupRemove401 | GroupRemove403 | GroupRemove500;
};