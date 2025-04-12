export interface Success<T> {
  data: T;
  error?: undefined;
}

export interface Failure<E extends Error> {
  data?: undefined;
  error: E;
}

export type Result<T, E extends Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E extends Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise };
  } catch (error) {
    return { error: error as E };
  }
}
