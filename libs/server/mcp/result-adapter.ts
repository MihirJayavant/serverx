import { isSuccess, type JsonType, type Result } from "@serverx/utils";

/** MCP `tools/call` response shape returned by a tool handler. */
export type McpToolCallResult = {
  /** Tool output rendered as text content blocks. */
  content: Array<{ type: "text"; text: string }>;
  /** Set when the result represents an error. */
  isError?: boolean;
};

/**
 * Adapt a {@link Result} into an {@link McpToolCallResult}. Success payloads
 * are JSON-serialized (a `null` payload becomes an empty string); errors are
 * returned as text content with `isError` set.
 */
export function resultToMcp<T extends JsonType>(
  result: Result<T>,
): McpToolCallResult {
  if (isSuccess(result)) {
    return {
      content: [{
        type: "text",
        text: result.data === null ? "" : JSON.stringify(result.data),
      }],
    };
  }
  return {
    content: [{
      type: "text",
      text: typeof result.error === "string"
        ? result.error
        : JSON.stringify(result.error),
    }],
    isError: true,
  };
}
