import {
  httpMethods,
  openApiRequestBody,
  openApiResponse,
} from "@serverx/utils";
import { type ActionContext } from "@serverx/server";
import { User, userOpenApiSchema } from "../../user/user.ts";
import { addUserHandler } from "../../user/add-user.handler.ts";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.POST;
export const description = "Add User user";

export const requestBody = openApiRequestBody({
  description: "User object that needs to be added",
  required: true,
  schema: userOpenApiSchema,
});

export async function handler({ body }: ActionContext<User>) {
  const request = await body();
  return addUserHandler(request);
}

export const responses = openApiResponse({
  status: 201,
  description: "User user Created",
  schema: userOpenApiSchema,
});
