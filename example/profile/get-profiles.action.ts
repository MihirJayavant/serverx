import { httpMethods } from "../../src/http/methods.ts";
import { successResult } from "../../src/http/result.ts";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.GET;
export const description = "Returns User Profile";

export function handler() {
  return successResult({
    result: [{
      name: "James Turner",
    }, {
      name: "Joe Turner",
    }],
  }, 200);
}

export const responses = {
  "200": {
    description: "User Profile",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
            },
            required: ["name"],
          },
        },
      },
    },
  },
};
