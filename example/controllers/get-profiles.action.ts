import {
  httpMethods,
  OffsetPaginationParams,
  openApiResponse,
} from "@serverx/utils";
import { userOpenApiSchema } from "../user/user.ts";
import { getProfilesHandler } from "../user/get-profiles.handler.ts";
import { ActionQueryContext } from "@serverx/server";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.GET;
export const description = "Returns User Profile";

export function handler(
  { query }: ActionQueryContext<OffsetPaginationParams>,
) {
  return getProfilesHandler(query);
}

export const responses = openApiResponse({
  status: 200,
  description: "User Profile",
  schema: {
    type: "array",
    items: userOpenApiSchema,
  },
});
