export const unauthorizedErrorDtoMessage = {
    "Authorization token not found": "Authorization token not found"
} as const;
export type UnauthorizedErrorDtoMessage = (typeof unauthorizedErrorDtoMessage)[keyof typeof unauthorizedErrorDtoMessage];
export const unauthorizedErrorDtoStatusCode = {
    "401": 401
} as const;
export type UnauthorizedErrorDtoStatusCode = (typeof unauthorizedErrorDtoStatusCode)[keyof typeof unauthorizedErrorDtoStatusCode];
export const unauthorizedErrorDtoError = {
    "Unauthorized": "Unauthorized"
} as const;
export type UnauthorizedErrorDtoError = (typeof unauthorizedErrorDtoError)[keyof typeof unauthorizedErrorDtoError];
export type UnauthorizedErrorDto = {
    /**
     * @default "JWT cookie or Bearer token not found"
     * @type string
    */
    message: UnauthorizedErrorDtoMessage;
    /**
     * @default 401
     * @type number
    */
    statusCode: UnauthorizedErrorDtoStatusCode;
    /**
     * @default "Unauthorized"
     * @type string
    */
    error?: UnauthorizedErrorDtoError | null;
};