export const forbiddenErrorDtoStatusCode = {
    "403": 403
} as const;
export type ForbiddenErrorDtoStatusCode = (typeof forbiddenErrorDtoStatusCode)[keyof typeof forbiddenErrorDtoStatusCode];
export const forbiddenErrorDtoResourceOp = {
    "CREATE": "CREATE",
    "READ": "READ",
    "UPDATE": "UPDATE",
    "DELETE": "DELETE"
} as const;
export type ForbiddenErrorDtoResourceOp = (typeof forbiddenErrorDtoResourceOp)[keyof typeof forbiddenErrorDtoResourceOp];
export const forbiddenErrorDtoError = {
    "Forbidden": "Forbidden"
} as const;
export type ForbiddenErrorDtoError = (typeof forbiddenErrorDtoError)[keyof typeof forbiddenErrorDtoError];
export type ForbiddenErrorDto = {
    /**
     * @default 403
     * @type number
    */
    statusCode: ForbiddenErrorDtoStatusCode;
    /**
     * @type string
    */
    message: string;
    /**
     * @type string
    */
    resourceId?: string | null;
    /**
     * @type string
    */
    resourceOp?: ForbiddenErrorDtoResourceOp | null;
    /**
     * @type string
    */
    error?: ForbiddenErrorDtoError | null;
};