import { httpMethods } from "../../src/http/methods.ts";
import { successResult } from "../../src/http/result.ts";
import { openApiResponse } from "../../src/index.ts";

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

export const responses = openApiResponse({
  status: 200,
  description: "User Profile",
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
});
