import type { InternalServerErrorDto } from "./InternalServerErrorDto";
import type { UnauthorizedErrorDto } from "./UnauthorizedErrorDto";
import type { ForbiddenErrorDto } from "./ForbiddenErrorDto";

 export type AxiosErrorResponseDto = {
    /**
     * @description Data of type T
    */
    data: (InternalServerErrorDto | UnauthorizedErrorDto | ForbiddenErrorDto);
};