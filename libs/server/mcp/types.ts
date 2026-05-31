import type { ZodType } from "@zod/zod";
import type { JsonType, Result, Task } from "@serverx/utils";

export type McpToolAnnotations = {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
};

export type McpInputSchema = Record<string, ZodType>;

export type McpToolAction<Input, Output extends JsonType> = {
  name: string;
  description: string;
  inputSchema: McpInputSchema;
  handler: (input: Input) => Task<Result<Output>>;
  annotations?: McpToolAnnotations;
};
