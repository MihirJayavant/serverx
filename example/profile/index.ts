import { Router } from "../../src/router.ts";
import * as getProfiles from "./get-profiles.action.ts";
import * as getProfile from "./get-profile.action.ts";

export const profileRouter = new Router({ basePath: "/profile" });

profileRouter.addAction(getProfiles);
profileRouter.addAction(getProfile);
