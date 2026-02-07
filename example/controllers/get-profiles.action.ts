import {
  httpMethods,
  OffsetPaginationParams,
  offsetPaginationParamSchema,
  OpenApiQueryTransform,
  openApiResponse,
} from "@serverx/utils";
import { userOpenApiSchema } from "../user/user.ts";
import { getProfilesHandler } from "../user/get-profiles.handler.ts";
import { ActionQueryContext } from "@serverx/server";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.GET;
export const description = "Returns User Profile";

export const parameters = offsetPaginationParamSchema;

export function handler(
  { query }: ActionQueryContext<OpenApiQueryTransform<OffsetPaginationParams>>,
) {
  return getProfilesHandler({
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    filters: query.filters,
    sort: query.sort,
  });
}

export const responses = openApiResponse({
  status: 200,
  description: "User Profile",
  schema: {
    type: "array",
    items: userOpenApiSchema,
  },
});
