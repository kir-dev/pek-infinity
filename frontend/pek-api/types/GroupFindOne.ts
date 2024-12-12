import type { GroupDto } from "./GroupDto";
import type { AxiosErrorDto } from "./AxiosErrorDto";

 export type GroupFindOnePathParams = {
    /**
     * @type string
    */
    id: string;
};
/**
 * @description Get one group
*/
export type GroupFindOne200 = GroupDto;
/**
 * @description Unauthorized
*/
export type GroupFindOne401 = AxiosErrorDto;
/**
 * @description Forbidden
*/
export type GroupFindOne403 = AxiosErrorDto;
/**
 * @description Internal Server Error
*/
export type GroupFindOne500 = AxiosErrorDto;
/**
 * @description Get one group
*/
export type GroupFindOneQueryResponse = GroupDto;
export type GroupFindOneQuery = {
    Response: GroupFindOneQueryResponse;
    PathParams: GroupFindOnePathParams;
    Errors: GroupFindOne401 | GroupFindOne403 | GroupFindOne500;
};