/**
 * @file retry.ts
 * Retry utility for asynchronous operations
 */

/**
 * Options for configuring the retry behavior
 */
export interface RetryOptions {
  /** Maximum number of attempts */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  delayMs: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff?: boolean;
  /** Optional predicate to determine if a retry should be attempted based on the error */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Executes an asynchronous function with a retry mechanism
 * @param fn - The asynchronous function to execute
 * @param options - Configuration options for the retry
 * @returns The result of the function execution
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxRetries,
    delayMs,
    useExponentialBackoff = true,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && shouldRetry(error)) {
        const delay = useExponentialBackoff
          ? delayMs * Math.pow(2, attempt)
          : delayMs;

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  throw lastError;
}
