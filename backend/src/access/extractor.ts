import { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { UserDto } from '@/auth/entities/user.entity';

export type ParamExtractor =
  | string // shorthand for param(paramName)
  | FnParamExtractor;

export type FnParamExtractor = (params: {
  ctx: ExecutionContext;
  req: Request;
  user?: UserDto;
}) => string | null | Promise<string | null>;

/**
 * Extract the input parameter of the guard from the params object
 * @param param - name of the parameter like 'id'
 * @param config - optional configuration for the extractor
 * @returns a configured `ParamExtractor`
 */
export const param = (param: string, { optional = false } = {}) =>
  (({ req }) => {
    if (optional || req.params[param]) return req.params[param] ?? null;
    throw new TypeError(`Param ${param} is not defined`);
  }) as FnParamExtractor;

/**
 * Extract the input parameter of the guard from the user object
 * @param config - optional configuration for the extractor
 * @returns a configured `ParamExtractor`
 */
export const userId = ({ optional = false } = {}) =>
  (({ user }) => {
    if (optional || user?.id) return user?.id ?? null;
    throw new TypeError(`User is not defined`);
  }) as FnParamExtractor;
