export const internalServerErrorDtoStatusCodeEnum = {
    "500": 500
} as const;

 export type InternalServerErrorDtoStatusCodeEnum = (typeof internalServerErrorDtoStatusCodeEnum)[keyof typeof internalServerErrorDtoStatusCodeEnum];

 export const internalServerErrorDtoMessageEnum = {
    "Internal Server Error": "Internal Server Error"
} as const;

 export type InternalServerErrorDtoMessageEnum = (typeof internalServerErrorDtoMessageEnum)[keyof typeof internalServerErrorDtoMessageEnum];

 export type InternalServerErrorDto = {
    /**
     * @default 500
     * @type number
    */
    statusCode: InternalServerErrorDtoStatusCodeEnum;
    /**
     * @default "Internal Server Error"
     * @type string
    */
    message: InternalServerErrorDtoMessageEnum;
};