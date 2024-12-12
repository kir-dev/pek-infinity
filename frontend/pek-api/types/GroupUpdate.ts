import type { GroupDto } from "./GroupDto";
import type { AxiosErrorDto } from "./AxiosErrorDto";
import type { UpdateGroupDto } from "./UpdateGroupDto";

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
/**
 * @description Update group
*/
export type GroupUpdateMutationResponse = GroupDto;
export type GroupUpdateMutation = {
    Response: GroupUpdateMutationResponse;
    Request: GroupUpdateMutationRequest;
    PathParams: GroupUpdatePathParams;
    Errors: GroupUpdate401 | GroupUpdate403 | GroupUpdate500;
};