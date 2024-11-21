import type { AxiosErrorResponseDto } from "./AxiosErrorResponseDto.ts";

 export type AxiosErrorDto = {
    /**
     * @type object
    */
    response: AxiosErrorResponseDto;
    /**
     * @type number
    */
    status: number;
};