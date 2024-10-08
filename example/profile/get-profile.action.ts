import { httpMethods } from "../../src/http/methods.ts";
import type { ActionContext } from "../../src/index.ts";
import { getProfileHandler } from "./get-profile.handler.ts";

export const tags = ["user"];
export const path = "/:userId";
export const method = httpMethods.GET;
export const description = "Returns User Profile";

export const parameters = [
  {
    "name": "userId",
    "in": "path",
    "description": "ID of User",
    "required": true,
    "schema": {
      "type": "string",
    },
  },
];

export function handler(
  { params }: ActionContext<unknown, unknown, { userId: string }>,
) {
  return getProfileHandler({ id: Number(params.userId) });
}

export const responses = {
  "200": {
    description: "User Profile",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
          "required": ["name"],
        },
      },
    },
  },
};
