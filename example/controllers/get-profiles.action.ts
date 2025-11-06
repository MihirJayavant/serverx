import { httpMethods, openApiResponse } from "@serverx/utils";
import { userSchema } from "../user/user.ts";
import { getProfilesHandler } from "../user/get-profiles.handler.ts";

export const tags = ["user"];
export const path = "/";
export const method = httpMethods.GET;
export const description = "Returns User Profile";

export function handler() {
  return getProfilesHandler(undefined);
}

export const responses = openApiResponse({
  status: 200,
  description: "User Profile",
  schema: {
    type: "array",
    items: userSchema,
  },
});
