export const unauthorizedErrorDtoMessage = {
    "JWT cookie not found": "JWT cookie not found"
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
     * @default "JWT cookie not found"
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