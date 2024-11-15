import type { CreateProfileDto } from "./CreateProfileDto";

 export type ProfileCreate201 = string;
export type ProfileCreateMutationRequest = CreateProfileDto;
export type ProfileCreateMutationResponse = string;
export type ProfileCreateMutation = {
    Response: ProfileCreateMutationResponse;
    Request: ProfileCreateMutationRequest;
};