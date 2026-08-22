import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { spy } from "@std/testing/mock";
import { isError, isSuccess, successResult } from "@serverx/utils";
import { z } from "@zod/zod";
import { baseHandler } from "./request-handler.ts";

const userSchema = z.object({ name: z.string() });

const baseHandlerTest = describe(baseHandler.name);

it(
  baseHandlerTest,
  "should call the handler when no schema is given",
  async () => {
    const handler = spy((input: { name: string }) => successResult(input));
    const result = await baseHandler({ handler })({ name: "John Doe" });

    assertEquals(handler.calls.length, 1);
    assertEquals(handler.calls[0].args[0], { name: "John Doe" });
    assert(isSuccess(result));
    assertEquals(result.data, { name: "John Doe" });
  },
);

it(
  baseHandlerTest,
  "should call the handler when validation passes",
  async () => {
    const result = await baseHandler({
      handler: (input: { name: string }) => successResult(input),
      validationSchema: userSchema,
    })({ name: "John Doe" });

    assert(isSuccess(result));
    assertEquals(result.status, 200);
    assertEquals(result.data, { name: "John Doe" });
  },
);

it(
  baseHandlerTest,
  "should return a bad request when validation fails",
  async () => {
    const result = await baseHandler({
      handler: (input: { name: string }) => successResult(input),
      validationSchema: userSchema,
    })({} as { name: string });

    assert(isError(result));
    assertEquals(result.status, 400);
    assertEquals(
      result.error,
      "✖ Invalid input: expected string, received undefined\n  → at name",
    );
  },
);

it(
  baseHandlerTest,
  "should not call the handler when validation fails",
  async () => {
    const handler = spy((input: { name: string }) => successResult(input));
    await baseHandler({ handler, validationSchema: userSchema })(
      {} as { name: string },
    );

    assertEquals(handler.calls.length, 0);
  },
);

it(baseHandlerTest, "should accept any input for an any schema", async () => {
  const handler = spy(() => successResult({ status: "healthy" }));
  const result = await baseHandler({ handler, validationSchema: z.any() })(
    undefined,
  );

  assertEquals(handler.calls.length, 1);
  assert(isSuccess(result));
  assertEquals(result.data, { status: "healthy" });
});
