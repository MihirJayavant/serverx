import {
  httpMethods,
  openApiRequestBody,
  openApiResponse,
  successResult,
} from "@serverx/utils";
import { type ActionContext } from "@serverx/server";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.POST;
export const description = "Add User Profile";

export const requestBody = openApiRequestBody({
  description: "User Profile",
  required: true,
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

export async function handler({ body }: ActionContext<{ name: string }>) {
  const request = await body();
  return successResult({ id: 5, name: request?.name }, 201);
}

export const responses = openApiResponse({
  status: 201,
  description: "User Profile Created",
  schema: {
    type: "object",
    properties: {
      id: {
        type: "number",
      },
      name: {
        type: "string",
      },
    },
    required: ["name"],
  },
});
