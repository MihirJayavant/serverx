import { cors, scalarUI, Server, swaggerUI, useLogger } from "@serverx/server";
import { userRouter } from "./controllers/user.ts";
import * as healthcheck from "./healthcheck.ts";

const app = new Server();

app.addMiddleware(useLogger({ level: "info" }));

app.addMiddleware(cors());

app.addHealthCheck(healthcheck);

app.addRouter(userRouter);

app.addOpenApi({
  url: "/api-docs",
  openapi: "3.0.0",
  info: { title: "user API", version: "1.0.0" },
});

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" } }));

app.serve({ port: 3100, hostname: "127.0.0.1" });

console.log("Swagger Docs: http://127.0.0.1:3100/swagger-docs");
console.log("Scalar Docs: http://127.0.0.1:3100/scalar-docs");
