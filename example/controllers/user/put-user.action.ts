import {
  httpMethods,
  openApiParameter,
  openApiRequestBody,
  openApiResponse,
} from "@serverx/utils";
import { type ActionContext } from "@serverx/server";
import { User, userOpenApiSchema } from "../../user/user.ts";
import { updateUserHandler } from "../../user/update-user.handler.ts";

export const tags = ["user"];
export const path = "/:userId";
export const method = httpMethods.PUT;
export const description = "Update User";

export const parameters = openApiParameter(
  {
    name: "userId",
    in: "path",
    description: "ID of User",
    required: true,
    schema: {
      type: "string",
    },
  },
);

export const requestBody = openApiRequestBody({
  description: "User object that needs to be updated",
  required: true,
  schema: userOpenApiSchema,
});

export async function handler(
  { params, body }: ActionContext<User, unknown, { userId: string }>,
) {
  const request = await body();
  return updateUserHandler({ ...request, id: Number(params.userId) });
}

export const responses = openApiResponse({
  status: 200,
  description: "User updated",
  schema: userOpenApiSchema,
});
