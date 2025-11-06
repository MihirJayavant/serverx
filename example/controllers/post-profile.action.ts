import {
  httpMethods,
  openApiRequestBody,
  openApiResponse,
} from "@serverx/utils";
import { type ActionContext } from "@serverx/server";
import { User, userSchema } from "../user/user.ts";
import { postProfileHandler } from "../user/post-profile.handler.ts";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.POST;
export const description = "Add User Profile";

export const requestBody = openApiRequestBody({
  description: "User Profile",
  required: true,
  schema: userSchema,
});

export async function handler({ body }: ActionContext<User>) {
  const request = await body();
  return postProfileHandler(request);
}

export const responses = openApiResponse({
  status: 201,
  description: "User Profile Created",
  schema: userSchema,
});
