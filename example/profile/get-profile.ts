import { httpMethods } from "../../src/http/methods.ts";

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

export function handler() {
  return Promise.resolve({
    name: "James Turner",
  });
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
