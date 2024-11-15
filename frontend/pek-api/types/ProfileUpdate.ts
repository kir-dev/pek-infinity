import type { UpdateProfileDto } from "./UpdateProfileDto";

 export type ProfileUpdatePathParams = {
    /**
     * @type string
    */
    id: string;
};
export type ProfileUpdate200 = string;
export type ProfileUpdateMutationRequest = UpdateProfileDto;
export type ProfileUpdateMutationResponse = string;
export type ProfileUpdateMutation = {
    Response: ProfileUpdateMutationResponse;
    Request: ProfileUpdateMutationRequest;
    PathParams: ProfileUpdatePathParams;
};