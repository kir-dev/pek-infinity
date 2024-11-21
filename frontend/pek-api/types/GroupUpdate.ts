import type { AxiosErrorDto } from "./AxiosErrorDto.ts";
import type { GroupDto } from "./GroupDto.ts";
import type { UpdateGroupDto } from "./UpdateGroupDto.ts";

 export type GroupUpdatePathParams = {
    /**
     * @type string
    */
    id: string;
};

 /**
 * @description Update group
*/
export type GroupUpdate200 = GroupDto;

 /**
 * @description Unauthorized
*/
export type GroupUpdate401 = AxiosErrorDto;

 /**
 * @description Forbidden
*/
export type GroupUpdate403 = AxiosErrorDto;

 /**
 * @description Internal Server Error
*/
export type GroupUpdate500 = AxiosErrorDto;

 export type GroupUpdateMutationRequest = UpdateGroupDto;

 export type GroupUpdateMutationResponse = GroupUpdate200;

 export type GroupUpdateMutation = {
    Response: GroupUpdate200;
    Request: GroupUpdateMutationRequest;
    PathParams: GroupUpdatePathParams;
    Errors: GroupUpdate401 | GroupUpdate403 | GroupUpdate500;
};