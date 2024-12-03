import { httpMethods, openApiParameter, openApiResponse } from "@serverx/utils";
import { type ActionContext } from "@serverx/server";
import { getProfileHandler } from "./get-profile.handler.ts";

export const tags = ["user"];
export const path = "/:userId";
export const method = httpMethods.GET;
export const description = "Returns User Profile";

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
  return getProfileHandler({ id: Number(params.userId) });
}

export const responses = openApiResponse({
  status: 200,
  description: "User Profile",
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
    },
    required: ["name"],
  },
});
