import type { JsonType } from "@serverx/utils";
import type { McpToolAction } from "./types.ts";

// deno-lint-ignore no-explicit-any
type AnyMcpToolAction = McpToolAction<any, any>;

export class McpRouter {
  readonly #tools: AnyMcpToolAction[] = [];

  addTool<Input, Output extends JsonType>(
    action: McpToolAction<Input, Output>,
  ): void {
    this.#tools.push(action as AnyMcpToolAction);
  }

  get tools(): readonly AnyMcpToolAction[] {
    return this.#tools;
  }
}
