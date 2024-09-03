import { Router } from "../../src/router.ts";
import * as getProfiles from "./get-profiles.ts";
import * as getProfile from "./get-profile.ts";

export const profileRouter = new Router({ basePath: "/profile" });

profileRouter.addAction(getProfiles);
profileRouter.addAction(getProfile);
