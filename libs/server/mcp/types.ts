import type { ZodType } from "@zod/zod";
import type { JsonType, Result, Task } from "@serverx/utils";

/**
 * Optional hints describing an MCP tool's behavior to the client. Mirror the
 * MCP specification's tool annotations.
 */
export type McpToolAnnotations = {
  /** Human-readable title for the tool. */
  title?: string;
  /** The tool does not modify state. */
  readOnlyHint?: boolean;
  /** The tool may perform destructive updates. */
  destructiveHint?: boolean;
  /** Repeated calls with the same arguments have no additional effect. */
  idempotentHint?: boolean;
  /** The tool interacts with external entities beyond the local system. */
  openWorldHint?: boolean;
};

/** Raw Zod shape (not wrapped in `z.object()`) describing a tool's input. */
export type McpInputSchema = Record<string, ZodType>;

/**
 * Definition of a single MCP tool: its name, description, input schema,
 * handler, and optional annotations.
 *
 * @typeParam Input - The validated input passed to the handler.
 * @typeParam Output - The success payload returned by the handler.
 */
export type McpToolAction<Input, Output extends JsonType> = {
  /** Unique tool name, conventionally `snake_case`. */
  name: string;
  /** Human-readable description shown to MCP clients. */
  description: string;
  /** Raw Zod shape describing the tool's input. */
  inputSchema: McpInputSchema;
  /** Handler invoked when the tool is called. */
  handler: (input: Input) => Task<Result<Output>>;
  /** Optional behavioral hints for the client. */
  annotations?: McpToolAnnotations;
};
