import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type TextContent = { type: "text"; text: string };

function firstText(content: unknown): string {
  const items = content as TextContent[];
  return items[0].text;
}

describe("MCP User Tools", () => {
  const endpoint = new URL("http://127.0.0.1:3100/mcp");
  let client: Client;

  beforeAll(async () => {
    client = new Client({ name: "user-mcp-spec", version: "0.1.0" });
    const transport = new StreamableHTTPClientTransport(endpoint);
    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  it("connects and completes the initialize handshake", () => {
    assertExists(client);
  });

  it("tools/list returns the five user tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t: { name: string }) => t.name).sort();
    assertEquals(names, [
      "add_user",
      "delete_user",
      "get_user",
      "list_users",
      "update_user",
    ]);
    const get = tools.find(
      (t: { name: string }) => t.name === "get_user",
    ) as { inputSchema: unknown; annotations?: { readOnlyHint?: boolean } };
    assertExists(get.inputSchema);
    assertEquals(get.annotations?.readOnlyHint, true);
  });

  it("get_user returns Peter Pan for id 1", async () => {
    const res = await client.callTool({
      name: "get_user",
      arguments: { userId: 1 },
    });
    assertEquals(res.isError ?? false, false);
    assertEquals(JSON.parse(firstText(res.content)), {
      id: 1,
      firstname: "Peter",
      lastname: "Pan",
      email: "peter.pan@example.com",
      age: 30,
    });
  });

  it("list_users with pageSize=3 returns three users", async () => {
    const res = await client.callTool({
      name: "list_users",
      arguments: { pageSize: 3 },
    });
    assertEquals(res.isError ?? false, false);
    const payload = JSON.parse(firstText(res.content)) as {
      data: unknown[];
    };
    assertEquals(Array.isArray(payload.data), true);
    assertEquals(payload.data.length, 3);
  });

  it("add_user creates a fresh user", async () => {
    const userId = 201;
    await client.callTool({
      name: "delete_user",
      arguments: { userId },
    });

    const newUser = {
      id: userId,
      firstname: "Mcp",
      lastname: "Created",
      email: "mcp.created@example.com",
      age: 33,
    };
    const res = await client.callTool({
      name: "add_user",
      arguments: newUser,
    });
    assertEquals(res.isError ?? false, false);
    assertEquals(JSON.parse(firstText(res.content)), newUser);
  });

  it("update_user modifies an existing user", async () => {
    const userId = 202;
    const base = {
      id: userId,
      firstname: "Mcp",
      lastname: "Update",
      email: "mcp.update@example.com",
      age: 41,
    };
    await client.callTool({ name: "delete_user", arguments: { userId } });
    await client.callTool({ name: "add_user", arguments: base });

    const next = { ...base, firstname: "Updated" };
    const res = await client.callTool({
      name: "update_user",
      arguments: next,
    });
    assertEquals(res.isError ?? false, false);
    assertEquals(JSON.parse(firstText(res.content)), next);
  });

  it("delete_user removes a user and a follow-up get reports isError", async () => {
    const userId = 203;
    const base = {
      id: userId,
      firstname: "Mcp",
      lastname: "Delete",
      email: "mcp.delete@example.com",
      age: 50,
    };
    await client.callTool({ name: "delete_user", arguments: { userId } });
    await client.callTool({ name: "add_user", arguments: base });

    const res = await client.callTool({
      name: "delete_user",
      arguments: { userId },
    });
    assertEquals(res.isError ?? false, false);
    assertEquals(JSON.parse(firstText(res.content)), {
      success: true,
      message: "User deleted successfully",
    });

    const followup = await client.callTool({
      name: "get_user",
      arguments: { userId },
    });
    assertEquals(followup.isError, true);
    assertEquals(firstText(followup.content), "User not found");
  });

  it("get_user on a missing id returns isError with 'User not found'", async () => {
    const res = await client.callTool({
      name: "get_user",
      arguments: { userId: 9999 },
    });
    assertEquals(res.isError, true);
    assertEquals(firstText(res.content), "User not found");
  });

  it("add_user with a conflicting id returns isError with 'User already exists'", async () => {
    const res = await client.callTool({
      name: "add_user",
      arguments: {
        id: 1,
        firstname: "Dup",
        lastname: "Licate",
        email: "dup@example.com",
        age: 20,
      },
    });
    assertEquals(res.isError, true);
    assertEquals(firstText(res.content), "User already exists");
  });

  it("calling an unknown tool surfaces an error", async () => {
    let threw = false;
    let result: Awaited<ReturnType<Client["callTool"]>> | undefined;
    try {
      result = await client.callTool({
        name: "no_such_tool",
        arguments: {},
      });
    } catch (_err) {
      threw = true;
    }
    assertEquals(threw || result?.isError === true, true);
  });

  it("get_user with invalid input (userId: 0) is rejected", async () => {
    let threw = false;
    let result: Awaited<ReturnType<Client["callTool"]>> | undefined;
    try {
      result = await client.callTool({
        name: "get_user",
        arguments: { userId: 0 },
      });
    } catch (_err) {
      threw = true;
    }
    if (threw) return;
    assertEquals(result!.isError, true);
  });
});
