import { cors, scalarUI, Server, swaggerUI } from "@serverx/server";
import { profileRouter } from "./profile/profile.ts";
import * as healthcheck from "./healthcheck.ts";

const app = new Server();

app.addMiddleware(cors());

app.addHealthCheck(healthcheck);

app.addRouter(profileRouter);

app.addOpenApi({
  url: "/api-docs",
  openapi: "3.0.0",
  info: { title: "Profile API", version: "1.0.0" },
});

app.addOpenApiUi("/swagger-docs", swaggerUI({ url: "/api-docs" }));
app.addOpenApiUi("/scalar-docs", scalarUI({ spec: { url: "/api-docs" } }));

app.serve({ port: 3100, hostname: "127.0.0.1" });

console.log("Swagger Docs: http://127.0.0.1:3100/swagger-docs");
console.log("Scalar Docs: http://127.0.0.1:3100/scalar-docs");
