/**
 * @file circuit-breaker.spec.ts
 * Tests for the CircuitBreaker utility
 */

import { assertEquals, assertRejects } from "@std/assert";
import {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
} from "./circuit-breaker.ts";

Deno.test("CircuitBreaker - initial state is CLOSED", () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 2,
    resetTimeoutMs: 1000,
  });
  assertEquals(breaker.getState(), CircuitState.CLOSED);
});

Deno.test("CircuitBreaker - opens after reaching failure threshold", async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 2,
    resetTimeoutMs: 1000,
  });

  const failingFn = () => Promise.reject(new Error("Failure"));

  // First failure
  await assertRejects(() => breaker.execute(failingFn));
  assertEquals(breaker.getState(), CircuitState.CLOSED);

  // Second failure -> opens
  await assertRejects(() => breaker.execute(failingFn));
  assertEquals(breaker.getState(), CircuitState.OPEN);

  // Subsequent calls should fail with CircuitBreakerError immediately
  await assertRejects(
    () => breaker.execute(() => Promise.resolve("success")),
    CircuitBreakerError,
  );
});

Deno.test("CircuitBreaker - transitions to HALF_OPEN after timeout", async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    resetTimeoutMs: 50,
  });

  const failingFn = () => Promise.reject(new Error("Failure"));

  await assertRejects(() => breaker.execute(failingFn));
  assertEquals(breaker.getState(), CircuitState.OPEN);

  // Wait for reset timeout
  await new Promise((resolve) => setTimeout(resolve, 60));

  assertEquals(breaker.getState(), CircuitState.HALF_OPEN);
});

Deno.test("CircuitBreaker - returns to CLOSED after success in HALF_OPEN", async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    resetTimeoutMs: 50,
    successThreshold: 2,
  });

  const failingFn = () => Promise.reject(new Error("Failure"));

  await assertRejects(() => breaker.execute(failingFn));
  assertEquals(breaker.getState(), CircuitState.OPEN);

  // Wait for reset timeout
  await new Promise((resolve) => setTimeout(resolve, 60));
  assertEquals(breaker.getState(), CircuitState.HALF_OPEN);

  // First success
  const result1 = await breaker.execute(() => Promise.resolve("success1"));
  assertEquals(result1, "success1");
  assertEquals(breaker.getState(), CircuitState.HALF_OPEN);

  // Second success -> CLOSED
  const result2 = await breaker.execute(() => Promise.resolve("success2"));
  assertEquals(result2, "success2");
  assertEquals(breaker.getState(), CircuitState.CLOSED);
});

Deno.test("CircuitBreaker - returns to OPEN if failure occurs in HALF_OPEN", async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    resetTimeoutMs: 50,
  });

  await assertRejects(() =>
    breaker.execute(() => Promise.reject(new Error("Fail")))
  );
  assertEquals(breaker.getState(), CircuitState.OPEN);

  await new Promise((resolve) => setTimeout(resolve, 60));
  assertEquals(breaker.getState(), CircuitState.HALF_OPEN);

  // Failure in HALF_OPEN -> OPEN immediately
  await assertRejects(() =>
    breaker.execute(() => Promise.reject(new Error("Fail again")))
  );
  assertEquals(breaker.getState(), CircuitState.OPEN);
});

Deno.test("CircuitBreaker - shouldCountAsFailure option", async () => {
  const breaker = new CircuitBreaker({
    failureThreshold: 1,
    resetTimeoutMs: 1000,
    shouldCountAsFailure: (err) => (err as Error).message === "Critical",
  });

  // Non-critical failure should not open circuit
  await assertRejects(() =>
    breaker.execute(() => Promise.reject(new Error("Ignore me")))
  );
  assertEquals(breaker.getState(), CircuitState.CLOSED);

  // Critical failure should open circuit
  await assertRejects(() =>
    breaker.execute(() => Promise.reject(new Error("Critical")))
  );
  assertEquals(breaker.getState(), CircuitState.OPEN);
});
