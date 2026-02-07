import { httpMethods, openApiParameter, openApiResponse } from "@serverx/utils";
import { type ActionContext } from "@serverx/server";
import { getUserHandler } from "../../user/get-user.handler.ts";
import { userOpenApiSchema } from "../../user/user.ts";

export const tags = ["user"];
export const path = "/:userId";
export const method = httpMethods.GET;
export const description = "Returns User";

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
  return getUserHandler({ id: Number(params.userId) });
}

export const responses = openApiResponse({
  status: 200,
  description: "Get User user",
  schema: userOpenApiSchema,
});
