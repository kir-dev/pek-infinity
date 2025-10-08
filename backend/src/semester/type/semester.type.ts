export const SEMESTER_REGEX = /^20[0-9]{2}-20[0-9]{2}\/[12]$/;

export type Semester = `20${number}-20${number}/${'1' | '2'}`;

// biome-ignore lint/suspicious/noRedeclare: this is safe
export function Semester(value: null): null;
// biome-ignore lint/suspicious/noRedeclare: this is safe
export function Semester(value: string): Semester;
export function Semester(value: string | null): Semester | null {
  return value as Semester;
}
