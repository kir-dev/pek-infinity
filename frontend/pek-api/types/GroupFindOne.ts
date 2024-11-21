import type { AxiosErrorDto } from "./AxiosErrorDto.ts";
import type { GroupDto } from "./GroupDto.ts";

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

 export type GroupFindOneQueryResponse = GroupFindOne200;

 export type GroupFindOneQuery = {
    Response: GroupFindOne200;
    PathParams: GroupFindOnePathParams;
    Errors: GroupFindOne401 | GroupFindOne403 | GroupFindOne500;
};