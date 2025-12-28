import z from 'zod';
import { $Enums } from '@/domains/prisma';

/**
 * Schema for a single contact entry
 */
export const ContactSchema = z.object({
  protocol: z.enum($Enums.ContactProtocol),
  value: z
    .string()
    .min(2, 'Value cannot be empty')
    .regex(/^\S/, 'Cannot start with whitespace')
    .regex(/\S$/, 'Cannot end with whitespace'),
});

/**
 * Batch schema for updating all contacts
 * The client sends the full list of desired contacts
 */
export const ContactBatchSchema = z.array(ContactSchema);

/**
 * Route parameters for contact operations
 */
export const ContactParamsSchema = z.object({
  userId: z.string(),
});
