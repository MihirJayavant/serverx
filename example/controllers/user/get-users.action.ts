import {
  httpMethods,
  OffsetPaginationParams,
  offsetPaginationParamSchema,
  OpenApiQueryTransform,
  openApiResponse,
} from "@serverx/utils";
import { userOpenApiSchema } from "../../user/user.ts";
import { getUsersHandler } from "../../user/get-users.handler.ts";
import { ActionQueryContext } from "@serverx/server";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.GET;
export const description = "Returns User";

export const parameters = offsetPaginationParamSchema;

export function handler(
  { query }: ActionQueryContext<OpenApiQueryTransform<OffsetPaginationParams>>,
) {
  return getUsersHandler({
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    filters: query.filters,
    sort: query.sort,
  });
}

export const responses = openApiResponse({
  status: 200,
  description: "Add new user",
  schema: {
    type: "array",
    items: userOpenApiSchema,
  },
});
