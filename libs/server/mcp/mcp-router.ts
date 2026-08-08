import type { JsonType } from "@serverx/utils";
import type { McpToolAction } from "./types.ts";

// deno-lint-ignore no-explicit-any
type AnyMcpToolAction = McpToolAction<any, any>;

/**
 * Aggregates {@link McpToolAction}s and exposes them to a {@link Server} for
 * registration on the MCP transport.
 */
export class McpRouter {
  readonly #tools: AnyMcpToolAction[] = [];

  /** Register a tool on this router. */
  addTool<Input, Output extends JsonType>(
    action: McpToolAction<Input, Output>,
  ): void {
    this.#tools.push(action as AnyMcpToolAction);
  }

  /** The tools registered on this router. */
  get tools(): readonly AnyMcpToolAction[] {
    return this.#tools;
  }
}
