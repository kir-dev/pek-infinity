import 'reflect-metadata';
import { InternalServerError, Unauthorized } from 'http-errors';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { JwtService } from './jwt.service';

const TEST_SECRET = 'key#b4rdC4t!';
const OTHER_SECRET = 'other_secret';

describe('JwtService', () => {
  const OLD_ENV = process.env;
  let service: JwtService;

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    service = new JwtService();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('signAsync and verifyAsync should succeed with valid secret', async () => {
    const payload = { userId: 'abc123' };
    const token = await service.signAsync(payload);
    const decoded = await service.verifyAsync(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('signAsync should throw InternalServerError if secret is empty', async () => {
    process.env.JWT_SECRET = '';
    const serviceEmpty = new JwtService();
    await expect(serviceEmpty.signAsync({ foo: 'bar' })).rejects.toThrow(
      InternalServerError
    );
  });

  it('verifyAsync should throw InternalServerError if secret is empty', async () => {
    process.env.JWT_SECRET = '';
    const serviceEmpty = new JwtService();
    await expect(serviceEmpty.verifyAsync('token')).rejects.toThrow(
      InternalServerError
    );
  });

  it('token signed by service1 cannot be verified by service2 with different secret', async () => {
    process.env.JWT_SECRET = TEST_SECRET;
    const service1 = new JwtService();
    process.env.JWT_SECRET = OTHER_SECRET;
    const service2 = new JwtService();

    const payload = { userId: 'abc123' };
    const token = await service1.signAsync(payload);

    await expect(service2.verifyAsync(token)).rejects.toThrow(Unauthorized);
  });
});
