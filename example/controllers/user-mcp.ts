import { McpRouter } from "@serverx/server";
import * as getUser from "./user/get-user.mcp.ts";
import * as getUsers from "./user/get-users.mcp.ts";
import * as addUser from "./user/post-user.mcp.ts";
import * as updateUser from "./user/put-user.mcp.ts";
import * as deleteUser from "./user/delete-user.mcp.ts";

export const userMcpRouter = new McpRouter();

userMcpRouter.addTool(getUser);
userMcpRouter.addTool(getUsers);
userMcpRouter.addTool(addUser);
userMcpRouter.addTool(updateUser);
userMcpRouter.addTool(deleteUser);
