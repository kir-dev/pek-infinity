export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const firstWord = words[0] ?? '';
  const lastWord = words.at(-1) ?? '';
  if (words.length === 1) {
    return firstWord.charAt(0).toUpperCase();
  }
  return (firstWord.charAt(0) + lastWord.charAt(0)).toUpperCase();
}
