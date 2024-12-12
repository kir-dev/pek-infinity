import type { GroupListItemDto } from "./GroupListItemDto";
import type { AxiosErrorDto } from "./AxiosErrorDto";

 export type GroupFindAllQueryParams = {
    /**
     * @type number | undefined
    */
    page?: number;
    /**
     * @type number | undefined
    */
    perPage?: number;
};
/**
 * @description Get all groups
*/
export type GroupFindAll200 = GroupListItemDto[];
/**
 * @description Unauthorized
*/
export type GroupFindAll401 = AxiosErrorDto;
/**
 * @description Forbidden
*/
export type GroupFindAll403 = AxiosErrorDto;
/**
 * @description Internal Server Error
*/
export type GroupFindAll500 = AxiosErrorDto;
/**
 * @description Get all groups
*/
export type GroupFindAllQueryResponse = GroupListItemDto[];
export type GroupFindAllQuery = {
    Response: GroupFindAllQueryResponse;
    QueryParams: GroupFindAllQueryParams;
    Errors: GroupFindAll401 | GroupFindAll403 | GroupFindAll500;
};