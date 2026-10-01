import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { successResult } from "@serverx/utils";
import { z } from "@zod/zod";
import { McpRouter } from "./mcp-router.ts";
import type { McpToolAction } from "./types.ts";

const getUserTool: McpToolAction<{ id: string }, { id: string }> = {
  name: "get_user",
  description: "Get a user by id",
  inputSchema: { id: z.string() },
  handler: (input) => successResult({ id: input.id }),
};

const listUsersTool: McpToolAction<unknown, { users: { id: string }[] }> = {
  name: "list_users",
  description: "List every user",
  inputSchema: {},
  handler: () => successResult({ users: [{ id: "1" }] }),
  annotations: { readOnlyHint: true },
};

const addToolTest = describe("McpRouter.addTool");

it(addToolTest, "should expose no tools before registration", () => {
  const router = new McpRouter();
  assertEquals(router.tools.length, 0);
});

it(addToolTest, "should expose a registered tool", () => {
  const router = new McpRouter();
  router.addTool(getUserTool);
  assertEquals(router.tools.length, 1);
  assertEquals(router.tools[0], getUserTool);
});

it(addToolTest, "should keep the annotations of a registered tool", () => {
  const router = new McpRouter();
  router.addTool(listUsersTool);
  assertEquals(router.tools[0].annotations, { readOnlyHint: true });
});

it(addToolTest, "should preserve the registration order", () => {
  const router = new McpRouter();
  router.addTool(getUserTool);
  router.addTool(listUsersTool);
  assertEquals(router.tools.map((tool) => tool.name), [
    "get_user",
    "list_users",
  ]);
});
