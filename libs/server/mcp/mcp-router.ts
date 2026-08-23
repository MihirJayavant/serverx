/**
 * @file mcp-router.ts
 * Aggregates MCP tools for registration on the transport
 */

import type { JsonType } from "@serverx/utils";
import type { McpToolAction } from "./types.ts";

// deno-lint-ignore no-explicit-any
type AnyMcpToolAction = McpToolAction<any, any>;

/**
 * Aggregates {@link McpToolAction}s and exposes them to a {@link Server} for
 * registration on the MCP transport.
 *
 * Tool names must be unique across every router mounted on one server — a
 * duplicate name overwrites the tool registered before it.
 *
 * @example
 * ```ts
 * const userMcpRouter = new McpRouter();
 * userMcpRouter.addTool(getUserTool);
 * userMcpRouter.addTool(createUserTool);
 *
 * app.addMcpRouter(userMcpRouter);
 * app.addMcp({ name: "user-api", version: "1.0.0" });
 * ```
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
