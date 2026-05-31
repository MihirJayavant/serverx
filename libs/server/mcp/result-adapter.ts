import { isSuccess, type JsonType, type Result } from "@serverx/utils";

export type McpToolCallResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

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
