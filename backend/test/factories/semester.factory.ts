// Using a simple function as a factory
// For more complex scenarios, consider libraries like 'fishery'
export const semesterFactory = {
  build: (attrs: Partial<{ name: string }> = {}): { name: string } => {
    return {
      name: '2024-2025/1',
      ...attrs,
    };
  },
};
