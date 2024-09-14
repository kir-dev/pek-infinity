export const internalServerErrorDtoStatusCode = {
    "500": 500
} as const;
export type InternalServerErrorDtoStatusCode = (typeof internalServerErrorDtoStatusCode)[keyof typeof internalServerErrorDtoStatusCode];
export const internalServerErrorDtoMessage = {
    "Internal Server Error": "Internal Server Error"
} as const;
export type InternalServerErrorDtoMessage = (typeof internalServerErrorDtoMessage)[keyof typeof internalServerErrorDtoMessage];
export type InternalServerErrorDto = {
    /**
     * @default 500
     * @type number
    */
    statusCode: InternalServerErrorDtoStatusCode;
    /**
     * @default "Internal Server Error"
     * @type string
    */
    message: InternalServerErrorDtoMessage;
};