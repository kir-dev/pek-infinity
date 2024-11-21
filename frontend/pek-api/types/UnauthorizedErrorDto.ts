export const unauthorizedErrorDtoMessageEnum = {
    "JWT cookie not found": "JWT cookie not found"
} as const;

 export type UnauthorizedErrorDtoMessageEnum = (typeof unauthorizedErrorDtoMessageEnum)[keyof typeof unauthorizedErrorDtoMessageEnum];

 export const unauthorizedErrorDtoStatusCodeEnum = {
    "401": 401
} as const;

 export type UnauthorizedErrorDtoStatusCodeEnum = (typeof unauthorizedErrorDtoStatusCodeEnum)[keyof typeof unauthorizedErrorDtoStatusCodeEnum];

 export const unauthorizedErrorDtoErrorEnum = {
    "Unauthorized": "Unauthorized"
} as const;

 export type UnauthorizedErrorDtoErrorEnum = (typeof unauthorizedErrorDtoErrorEnum)[keyof typeof unauthorizedErrorDtoErrorEnum];

 export type UnauthorizedErrorDto = {
    /**
     * @default "JWT cookie not found"
     * @type string
    */
    message: UnauthorizedErrorDtoMessageEnum;
    /**
     * @default 401
     * @type number
    */
    statusCode: UnauthorizedErrorDtoStatusCodeEnum;
    /**
     * @default "Unauthorized"
     * @type string
    */
    error?: UnauthorizedErrorDtoErrorEnum | null;
};