import { Server } from "../src/server.ts";

const app = new Server();

app.serve({ port: 3100, hostname: "127.0.0.1" });
