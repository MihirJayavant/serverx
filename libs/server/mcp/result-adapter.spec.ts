import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { errorResult, statusCodes, successResult } from "@serverx/utils";
import { resultToMcp } from "./result-adapter.ts";

const resultToMcpTest = describe(resultToMcp.name);

it(resultToMcpTest, "should serialize a success payload as text", () => {
  const result = resultToMcp(successResult({ id: 1, name: "John Doe" }));
  assertEquals(result.content, [{
    type: "text",
    text: JSON.stringify({ id: 1, name: "John Doe" }),
  }]);
});

it(resultToMcpTest, "should return empty text for a null payload", () => {
  const result = resultToMcp(successResult(null, statusCodes.NoContent));
  assertEquals(result.content, [{ type: "text", text: "" }]);
});

it(resultToMcpTest, "should not set isError for a success result", () => {
  const result = resultToMcp(successResult({ id: 1 }));
  assertEquals(result.isError, undefined);
});

it(resultToMcpTest, "should return a string error as text", () => {
  const result = resultToMcp(
    errorResult("User not found", statusCodes.NotFound),
  );
  assertEquals(result, {
    content: [{ type: "text", text: "User not found" }],
    isError: true,
  });
});

it(resultToMcpTest, "should serialize a non string error as text", () => {
  const error = { message: "Email taken", field: "email" };
  const result = resultToMcp(errorResult(error, statusCodes.Conflict));
  assertEquals(result, {
    content: [{ type: "text", text: JSON.stringify(error) }],
    isError: true,
  });
});
