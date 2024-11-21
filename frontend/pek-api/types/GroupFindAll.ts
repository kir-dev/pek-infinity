import type { AxiosErrorDto } from "./AxiosErrorDto.ts";
import type { GroupListItemDto } from "./GroupListItemDto.ts";

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

 export type GroupFindAllQueryResponse = GroupFindAll200;

 export type GroupFindAllQuery = {
    Response: GroupFindAll200;
    QueryParams: GroupFindAllQueryParams;
    Errors: GroupFindAll401 | GroupFindAll403 | GroupFindAll500;
};