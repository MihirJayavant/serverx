import { httpMethods, openApiParameter, openApiResponse } from "@serverx/utils";
import { type ActionContext } from "@serverx/server";
import { deleteUserHandler } from "../../user/delete-user.handler.ts";

export const tags = ["user"];
export const path = "/:userId";
export const method = httpMethods.DELETE;
export const description = "Delete User";

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

export function handler(
  { params }: ActionContext<unknown, unknown, { userId: string }>,
) {
  return deleteUserHandler({ id: Number(params.userId) });
}

export const responses = openApiResponse({
  status: 200,
  description: "User deleted",
  schema: {
    type: "object",
    properties: {
      success: { type: "boolean" },
      message: { type: "string" },
    },
    required: ["success", "message"],
  },
});
