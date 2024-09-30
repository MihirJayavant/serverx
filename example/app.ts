import { Server } from "../src/server.ts";
import { profileRouter } from "./profile/index.ts";
import { cors } from "@hono/hono/cors";

const app = new Server();

app.addMiddleware(cors());

app.addRouter(profileRouter);
app.addOpenApi({
  url: "/doc",
  openapi: "3.0.0",
  info: { title: "Profile API", version: "1.0.0" },
});

app.serve({ port: 3100, hostname: "127.0.0.1" });
