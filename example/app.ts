import { Server } from "../src/server.ts";
import { profileRouter } from "./profile/index.ts";

const app = new Server();

app.addRouter(profileRouter);
app.addOpenApi({ url: "/doc" });

app.serve({ port: 3100, hostname: "127.0.0.1" });
