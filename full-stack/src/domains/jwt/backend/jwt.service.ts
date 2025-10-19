import { InternalServerError, Unauthorized } from 'http-errors';
import jwt, { type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { env } from '@/env';

const MISSING_JWT_SECRET_ERROR = new InternalServerError(
  'JWT_SECRET is not configured'
);

@injectable()
export class JwtService {
  private readonly secret = env.JWT_SECRET;

  /**
   * Sign a payload and return a JWT token
   * @param payload The payload to sign
   * @param options JWT sign options
   * @returns Promise resolving to the JWT token
   */
  async signAsync<TPayLoad extends Record<string, any> = any>(
    payload: TPayLoad,
    options?: SignOptions
  ): Promise<string> {
    const signOptions = {
      expiresIn: '7d' as const,
      ...options,
    };

    const secret = this.secret;
    if (!secret) {
      throw MISSING_JWT_SECRET_ERROR;
    }

    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, signOptions, (err, token) => {
        if (err || !token) {
          console.error(err);
          return reject(new InternalServerError('Error signing token'));
        }
        resolve(token);
      });
    });
  }

  /**
   * Verify a JWT token and return the decoded payload
   * @param token The JWT token to verify
   * @param options JWT verify options
   * @returns Promise resolving to the decoded payload
   */
  async verifyAsync<T = any>(
    token: string,
    options?: VerifyOptions
  ): Promise<T> {
    const secret = this.secret;
    if (!secret) {
      throw MISSING_JWT_SECRET_ERROR;
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (err, decoded) => {
        if (err || !decoded) {
          return reject(new Unauthorized('Invalid token'));
        }
        resolve(decoded as T);
      });
    });
  }
}
