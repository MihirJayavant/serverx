import { assertEquals } from "jsr:@std/assert";
import { isError, isSuccess, statusCodes } from "./result.ts";

Deno.test("isSuccess", () => {
  const successResult = {
    status: statusCodes.Ok,
    data: {
      name: "John Doe",
    },
  };
  assertEquals(isSuccess(successResult), true);
});

Deno.test("isError", () => {
  const errorResult = {
    status: statusCodes.InternalServerError,
    error: "Internal Server Error",
  };
  assertEquals(isError(errorResult), true);
});
