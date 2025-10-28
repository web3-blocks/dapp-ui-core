/**
 * Consistent error handler with strict typing
 *
 * @param err - Any caught error (unknown type from try/catch)
 * @param fallbackMessage - Default message if not an Error instance
 * @returns HandledError object with safe, typed fields
 */
export function errorHandler(
  err: unknown,
  fallbackMessage: string = "An unexpected error occurred"
): {
  isError: boolean;
  message: string;
  name?: string;
  cause?: string;
  stack?: string;
  raw: unknown;
} {
  if (err instanceof Error) {
    return {
      isError: true,
      message: err.message || fallbackMessage,
      name: err.name,
      cause: err.cause ? String(err.cause) : undefined,
      stack: err.stack,
      raw: err,
    };
  }

  return {
    isError: false,
    message: fallbackMessage,
    raw: err,
  };
}
