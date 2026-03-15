import { assertEquals, assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";
import { withRetry } from "./retry.ts";

const withRetryTests = describe("withRetry");

it(
  withRetryTests,
  "should return value on first attempt if successful",
  async () => {
    let calls = 0;
    const fn = () => {
      calls++;
      return Promise.resolve("success");
    };

    const result = await withRetry(fn, { maxRetries: 3, delayMs: 10 });
    assertEquals(result, "success");
    assertEquals(calls, 1);
  },
);

it(
  withRetryTests,
  "should retry and succeed if subsequent attempts pass",
  async () => {
    let calls = 0;
    const fn = () => {
      calls++;
      if (calls < 3) return Promise.reject(new Error("fail"));
      return Promise.resolve("success");
    };

    const result = await withRetry(fn, { maxRetries: 3, delayMs: 1 });
    assertEquals(result, "success");
    assertEquals(calls, 3);
  },
);

it(
  withRetryTests,
  "should throw the last error after max retries are exhausted",
  async () => {
    let calls = 0;
    const fn = () => {
      calls++;
      return Promise.reject(new Error(`error ${calls}`));
    };

    await assertRejects(
      () => withRetry(fn, { maxRetries: 2, delayMs: 1 }),
      Error,
      "error 3",
    );
    assertEquals(calls, 3);
  },
);

it(withRetryTests, "should not retry if maxRetries is 0", async () => {
  let calls = 0;
  const fn = () => {
    calls++;
    return Promise.reject(new Error("fail"));
  };

  await assertRejects(
    () => withRetry(fn, { maxRetries: 0, delayMs: 1 }),
    Error,
    "fail",
  );
  assertEquals(calls, 1);
});

it(
  withRetryTests,
  "should stop retrying if shouldRetry returns false",
  async () => {
    let calls = 0;
    const fn = () => {
      calls++;
      return Promise.reject(new Error("fatal"));
    };

    await assertRejects(
      () =>
        withRetry(fn, {
          maxRetries: 5,
          delayMs: 1,
          shouldRetry: (err) => (err as Error).message !== "fatal",
        }),
      Error,
      "fatal",
    );
    assertEquals(calls, 1);
  },
);

it(withRetryTests, "should use exponential backoff by default", async () => {
  using time = new FakeTime();
  let calls = 0;
  const fn = () => {
    calls++;
    if (calls < 4) return Promise.reject(new Error("fail"));
    return Promise.resolve("success");
  };

  const retryPromise = withRetry(fn, {
    maxRetries: 3,
    delayMs: 100,
  });

  // Attempt 1 fails at T=0
  await time.runMicrotasks();
  assertEquals(calls, 1);

  // Wait 100ms (100 * 2^0)
  await time.tick(100);
  await time.runMicrotasks();
  assertEquals(calls, 2);

  // Wait 200ms (100 * 2^1)
  await time.tick(200);
  await time.runMicrotasks();
  assertEquals(calls, 3);

  // Wait 400ms (100 * 2^2)
  await time.tick(400);
  await time.runMicrotasks();
  assertEquals(calls, 4);

  const result = await retryPromise;
  assertEquals(result, "success");
});

it(
  withRetryTests,
  "should use fixed delay if useExponentialBackoff is false",
  async () => {
    using time = new FakeTime();
    let calls = 0;
    const fn = () => {
      calls++;
      if (calls < 3) return Promise.reject(new Error("fail"));
      return Promise.resolve("success");
    };

    const retryPromise = withRetry(fn, {
      maxRetries: 3,
      delayMs: 100,
      useExponentialBackoff: false,
    });

    // Attempt 1 fails at T=0
    await time.runMicrotasks();
    assertEquals(calls, 1);

    // Wait 100ms
    await time.tick(100);
    await time.runMicrotasks();
    assertEquals(calls, 2);

    // Wait 100ms
    await time.tick(100);
    await time.runMicrotasks();
    assertEquals(calls, 3);

    const result = await retryPromise;
    assertEquals(result, "success");
  },
);
