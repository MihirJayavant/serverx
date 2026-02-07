import { Router } from "@serverx/server";
import * as getusers from "./user/get-users.action.ts";
import * as getuser from "./user/get-user.action.ts";
import * as postUser from "./user/post-user.action.ts";
import * as putUser from "./user/put-user.action.ts";
import * as deleteUser from "./user/delete-user.action.ts";

export const userRouter = new Router({ basePath: "/user" });

userRouter.addAction(getusers);
userRouter.addAction(postUser);
userRouter.addAction(getuser);
userRouter.addAction(putUser);
userRouter.addAction(deleteUser);
