/**
 * @file circuit-breaker.ts
 * Circuit breaker utility for preventing cascading failures in distributed systems.
 *
 * The Circuit Breaker pattern is used to detect failures and encapsulates the logic
 * of preventing a failure from constantly recurring, during maintenance, temporary
 * external system failure or unexpected system difficulties.
 */

/**
 * Possible states of the circuit breaker
 */
export enum CircuitState {
  /** Normal operation: requests are allowed to pass through */
  CLOSED = "CLOSED",
  /** Failure state: requests are blocked and fail immediately */
  OPEN = "OPEN",
  /** Trial state: a limited number of requests are allowed to pass through to test if the service has recovered */
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Options for configuring the circuit breaker
 */
export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time in milliseconds to wait before switching from OPEN to HALF_OPEN */
  resetTimeoutMs: number;
  /** Number of successful attempts in HALF_OPEN to switch back to CLOSED */
  successThreshold?: number;
  /** Optional predicate to determine if an error should count as a failure */
  shouldCountAsFailure?: (error: unknown) => boolean;
}

/**
 * Error thrown when a request is blocked by an open circuit breaker
 */
export class CircuitBreakerError extends Error {
  constructor(message: string = "Circuit breaker is OPEN. Request blocked.") {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

/**
 * Generic Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      ...options,
      successThreshold: options.successThreshold ?? 1,
      shouldCountAsFailure: options.shouldCountAsFailure ?? (() => true),
    };
  }

  /**
   * Returns the current state of the circuit breaker, performing state transitions if necessary.
   */
  getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      }
    }
    return this.state;
  }

  /**
   * Executes an asynchronous function wrapped with circuit breaker logic.
   *
   * @param fn - The asynchronous function to execute
   * @throws {CircuitBreakerError} If the circuit is OPEN
   * @throws {Error} The original error if the function fails
   * @returns The result of the function execution
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === CircuitState.OPEN) {
      throw new CircuitBreakerError();
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (this.options.shouldCountAsFailure(error)) {
        this.onFailure();
      }
      throw error;
    }
  }

  /**
   * Forces the circuit breaker into a specific state.
   * Useful for testing or manual overrides.
   */
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === CircuitState.CLOSED) {
      this.failures = 0;
    } else if (state === CircuitState.HALF_OPEN) {
      this.successes = 0;
    } else if (state === CircuitState.OPEN) {
      this.lastFailureTime = Date.now();
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (
      this.state === CircuitState.CLOSED &&
      this.failures >= this.options.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    }
  }
}

/**
 * Functional wrapper for executing an asynchronous operation with a circuit breaker.
 *
 * @param fn - The asynchronous function to execute
 * @param breaker - The CircuitBreaker instance to use
 * @returns The result of the function execution
 */
export async function withCircuitBreaker<T>(
  fn: () => Promise<T>,
  breaker: CircuitBreaker,
): Promise<T> {
  return await breaker.execute(fn);
}
