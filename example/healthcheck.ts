import { healthCheckHandler, healthCheckResponse } from "@serverx/server";
import { httpMethods } from "@serverx/utils";

export const tags = [];
export const path = "/healthcheck";
export const method = httpMethods.GET;
export const description = "Returns healthcheck status";

export function handler() {
  return healthCheckHandler({
    dependencies: [],
  });
}

export const responses = healthCheckResponse();
