export const forbiddenErrorDtoStatusCodeEnum = {
    "403": 403
} as const;

 export type ForbiddenErrorDtoStatusCodeEnum = (typeof forbiddenErrorDtoStatusCodeEnum)[keyof typeof forbiddenErrorDtoStatusCodeEnum];

 export const forbiddenErrorDtoResourceOpEnum = {
    "CREATE": "CREATE",
    "READ": "READ",
    "UPDATE": "UPDATE",
    "DELETE": "DELETE"
} as const;

 export type ForbiddenErrorDtoResourceOpEnum = (typeof forbiddenErrorDtoResourceOpEnum)[keyof typeof forbiddenErrorDtoResourceOpEnum];

 export const forbiddenErrorDtoErrorEnum = {
    "Forbidden": "Forbidden"
} as const;

 export type ForbiddenErrorDtoErrorEnum = (typeof forbiddenErrorDtoErrorEnum)[keyof typeof forbiddenErrorDtoErrorEnum];

 export type ForbiddenErrorDto = {
    /**
     * @default 403
     * @type number
    */
    statusCode: ForbiddenErrorDtoStatusCodeEnum;
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
    resourceOp?: ForbiddenErrorDtoResourceOpEnum | null;
    /**
     * @type string
    */
    error?: ForbiddenErrorDtoErrorEnum | null;
};