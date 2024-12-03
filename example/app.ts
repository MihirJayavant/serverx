import { cors, Server } from "@serverx/server";
import { profileRouter } from "./profile/profile.ts";

const app = new Server();

app.addMiddleware(cors());

app.addRouter(profileRouter);
app.addOpenApi({
  url: "/doc",
  openapi: "3.0.0",
  info: { title: "Profile API", version: "1.0.0" },
});

app.addSwagger();
app.addScalar();

app.serve({ port: 3100, hostname: "127.0.0.1" });
