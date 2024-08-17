import { Router } from "../../src/router.ts";
import * as getProfile from "./get-profile.ts";

export const profileRouter = new Router({ basePath: "/profile" });
profileRouter.addAction(getProfile);
