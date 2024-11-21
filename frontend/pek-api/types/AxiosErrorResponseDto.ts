import type { ForbiddenErrorDto } from "./ForbiddenErrorDto.ts";
import type { InternalServerErrorDto } from "./InternalServerErrorDto.ts";
import type { UnauthorizedErrorDto } from "./UnauthorizedErrorDto.ts";

 export type AxiosErrorResponseDto = {
    /**
     * @description Data of type T
    */
    data: (InternalServerErrorDto | UnauthorizedErrorDto | ForbiddenErrorDto);
};