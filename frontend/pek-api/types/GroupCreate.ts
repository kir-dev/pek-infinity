import type { GroupDto } from "./GroupDto";
import type { AxiosErrorDto } from "./AxiosErrorDto";
import type { CreateGroupDto } from "./CreateGroupDto";

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
/**
 * @description Create group
*/
export type GroupCreateMutationResponse = GroupDto;
export type GroupCreateMutation = {
    Response: GroupCreateMutationResponse;
    Request: GroupCreateMutationRequest;
    Errors: GroupCreate401 | GroupCreate403 | GroupCreate500;
};