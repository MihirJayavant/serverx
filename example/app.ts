import { cors, scalarUI, Server, swaggerUI, useLogger } from "@serverx/server";
import { serve } from "@serverx/server/deno";
import { userRouter } from "./controllers/user.ts";
import { userMcpRouter } from "./controllers/user-mcp.ts";
import * as healthcheck from "./healthcheck.ts";
import { logger } from "./core/logger.ts";

const app = new Server();

app.addMiddleware(useLogger({ level: "debug" }));

app.addMiddleware(cors());

app.addHealthCheck(healthcheck);

app.addRouter(userRouter);

app.addMcpRouter(userMcpRouter);
app.addMcp({ path: "/mcp", name: "serverx-example", version: "1.0.0" });

app.addOpenApi({
  url: "/api-docs",
  openapi: "3.0.0",
  info: { title: "user API", version: "1.0.0" },
});

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" } }));

serve(app, { port: 3100, hostname: "127.0.0.1" });

logger.info("Swagger Docs: http://127.0.0.1:3100/swagger-docs");
logger.info("Scalar Docs: http://127.0.0.1:3100/scalar-docs");
logger.info("MCP Endpoint:  http://127.0.0.1:3100/mcp");
