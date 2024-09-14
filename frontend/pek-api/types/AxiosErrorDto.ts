import type { AxiosErrorResponseDto } from "./AxiosErrorResponseDto";

 export type AxiosErrorDto = {
    response: AxiosErrorResponseDto;
    /**
     * @type number
    */
    status: number;
};