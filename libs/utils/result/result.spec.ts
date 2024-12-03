import { assertEquals } from "@std/assert";
import { isError, isSuccess, statusCodes } from "./result.ts";
import { describe, it } from "@std/testing/bdd";

const isSuccessTest = describe(isSuccess.name);

it(isSuccessTest, "should return true for success result", () => {
  const successResult = {
    status: statusCodes.Ok,
    data: {
      name: "John Doe",
    },
  };
  assertEquals(isSuccess(successResult), true);
});

it(isSuccessTest, "should return false for error result", () => {
  const errorResult = {
    status: statusCodes.InternalServerError,
    error: "Internal Server Error",
  };
  assertEquals(isSuccess(errorResult), false);
});

const isErrorTest = describe(isError.name);

it(isErrorTest, "should return false for success result", () => {
  const successResult = {
    status: statusCodes.Ok,
    data: {
      name: "John Doe",
    },
  };
  assertEquals(isError(successResult), false);
});

it(isErrorTest, "should return true for error result", () => {
  const errorResult = {
    status: statusCodes.InternalServerError,
    error: "Internal Server Error",
  };
  assertEquals(isError(errorResult), true);
});
