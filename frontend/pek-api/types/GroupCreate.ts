import type { AxiosErrorDto } from "./AxiosErrorDto.ts";
import type { CreateGroupDto } from "./CreateGroupDto.ts";
import type { GroupDto } from "./GroupDto.ts";

 /**
 * @description Create group
*/
export type GroupCreate201 = GroupDto;

 /**
 * @description Unauthorized
*/
export type GroupCreate401 = AxiosErrorDto;

 /**
 * @description Forbidden
*/
export type GroupCreate403 = AxiosErrorDto;

 /**
 * @description Internal Server Error
*/
export type GroupCreate500 = AxiosErrorDto;

 export type GroupCreateMutationRequest = CreateGroupDto;

 export type GroupCreateMutationResponse = GroupCreate201;

 export type GroupCreateMutation = {
    Response: GroupCreate201;
    Request: GroupCreateMutationRequest;
    Errors: GroupCreate401 | GroupCreate403 | GroupCreate500;
};