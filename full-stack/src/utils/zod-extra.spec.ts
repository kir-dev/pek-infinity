import { describe, expect, it } from 'vitest';
import z from 'zod/v4';
import { ensureZodObject, httpSchema } from './zod-extra';

describe('ZodExtra', () => {
  describe('ensureZodObject', () => {
    const rawShape = { name: z.string(), age: z.number() };
    const _returnType = z.object(rawShape);

    it('should return the same ZodObject instance if input is already a ZodObject', () => {
      const resultSchema = ensureZodObject(
        z.object(rawShape)
      ) satisfies typeof _returnType;
      expect(resultSchema).toBeInstanceOf(z.ZodObject);
      expect(resultSchema.shape).toEqual(rawShape);
    });

    it('should convert a raw shape into a ZodObject', () => {
      const resultSchema = ensureZodObject(
        rawShape
      ) satisfies typeof _returnType;
      expect(resultSchema).toBeInstanceOf(z.ZodObject);
      expect(resultSchema.shape).toEqual(rawShape);
    });
  });
  describe('httpSchema', () => {
    it('should handle empty config', () => {
      const schema = httpSchema();
      expect(schema).toBeInstanceOf(z.ZodObject);
      expect(schema.shape).toEqual({});
      expect(schema.parse({})).toEqual({});
    });
    it('should wrap a ZodObject data schema in a data property', () => {
      const schema = httpSchema({ body: z.object({ name: z.string() }) });

      expect(schema).toBeInstanceOf(z.ZodObject);

      expect(JSON.stringify(schema.shape)).toBe(
        JSON.stringify(z.object({ body: z.object({ name: z.string() }) }).shape)
      );

      expect(schema.parse({ body: { name: 'Test' } })).toEqual({
        body: { name: 'Test' },
      });
    });

    it('should wrap a plain data object in a data property', () => {
      const schema = httpSchema({ body: { name: z.string() } });
      expect(schema).toBeInstanceOf(z.ZodObject);

      expect(JSON.stringify(schema.shape)).toBe(
        JSON.stringify(z.object({ body: z.object({ name: z.string() }) }).shape)
      );
      expect(schema.parse({ body: { name: 'Test' } })).toEqual({
        body: { name: 'Test' },
      });
    });

    it('should accept empty object as schema', () => {
      const schema = httpSchema();
      expect(schema).toBeInstanceOf(z.ZodObject);
      expect(schema.shape).toBeDefined();
      schema.parse({});
    });

    it('should add pagination properties when specified', () => {
      const schema = httpSchema({ pagination: true });
      expect(schema.shape.page).toBeDefined();
      expect(schema.shape.page).toBeDefined();

      const result = schema.parse({});
      expect(result).toEqual({
        page: { skip: expect.any(Number), take: expect.any(Number) },
      });
    });

    it('should not add pagination properties when not specified', () => {
      const schema = httpSchema();
      expect(schema.shape.page).not.toBeDefined();

      const result = schema.parse({});
      expect(result).toEqual({});
    });

    it('should add primitive param as param property', () => {
      const schema = httpSchema({ params: { userId: z.string() } });
      expect(schema.shape.params).toBeDefined();
      expect(schema.shape.params.shape.userId).toBeDefined();

      const result = schema.parse({ params: { userId: 'test' } });
      expect(result).toEqual({ params: { userId: 'test' } });
    });
  });
});
